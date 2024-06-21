/* Copyright (C) 2024  Tomat et al.
 * Copyright (C) 2022  GooseNest
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License as published by the
 * Free Software Foundation, either version 3 of the License, or (at your
 * option) any later versions.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses>.
 */

import { join } from "node:path";
import { getSettings } from "../config/app-settings";
import { assertNotNull } from "../util/validation";
import { getVersionedUserDataPath } from "../util/paths";
import { addGlobalPath } from "../util/global-paths";
import {
    createWriteStream,
    mkdirSync,
    readFileSync,
    rmSync,
    writeFileSync,
} from "node:fs";
import { app, type AutoUpdater, autoUpdater, dialog } from "electron";
import EventEmitter from "node:events";
import { get } from "node:https";
import type { IncomingMessage } from "node:http";
import { log } from "../util/logging";
import { execFile } from "node:child_process";
import { exit } from "node:process";

type TrackedOperations = {
    done: number;
    total: number;
    fail: number;
};

// Important modules to always load.
const CORE_MODULES = ["discord_core", "utils", "voice"];

export const events = new EventEmitter();
export const INSTALLED_MODULE = "installed-module"; // DiscordNative ensureModule

let skipHost = false;
let skipModule = false;

let basePath: string | undefined;
let manifestPath: string | undefined;
let downloadPath: string | undefined;

let downloading: TrackedOperations = { done: 0, total: 0, fail: 0 };
let installing: TrackedOperations = { done: 0, total: 0, fail: 0 };

let installed: Record<string, { installedVersion: number }> = {};
let remote: Record<string, number> = {};

let hostUpdater: AutoUpdater | undefined;

let baseUrl: string | undefined;
let queryString: string | undefined;

let lastUpdateCheckTimestamp = 0;

function resetTrackedOperations(): void {
    downloading = { done: 0, total: 0, fail: 0 };
    installing = { done: 0, total: 0, fail: 0 };
}

function getHostUpdater(): AutoUpdater {
    if (process.platform === "linux") {
        return new (class LinuxHostUpdater
            extends EventEmitter
            implements AutoUpdater
        {
            url = "";

            setFeedURL(options: Electron.FeedURLOptions): void {
                this.url = options.url;
            }

            getFeedURL(): string {
                return this.url;
            }

            checkForUpdates(): void {
                requestUrl(this.url).then(([response, data]) => {
                    if (response.statusCode === 204) {
                        return this.emit("update-not-available");
                    }

                    this.emit("update-manually", data);
                });
            }

            quitAndInstall(): void {
                app.relaunch();
                app.quit();
            }
        })();
    }

    // TODO: Does Win32 need a new implementation?

    return autoUpdater;
}

/**
 * Initializes the module updater.
 * @param endpoint The endpoint to use to check for and acquire updates.
 * @param releaseChannel The release channel of this installation.
 * @param version The version.
 */
export function initializeModuleUpdater(
    endpoint: string,
    releaseChannel: string,
    version: string,
): void {
    const settings = getSettings();
    skipHost = settings.get<boolean>("SKIP_HOST_UPDATE");
    skipModule = settings.get<boolean>("SKIP_MODULE_UPDATE");

    basePath = join(assertNotNull(getVersionedUserDataPath()), "modules");
    manifestPath = join(basePath, "installed.json");
    downloadPath = join(basePath, "pending");

    addGlobalPath(basePath);
    resetTrackedOperations();

    rmSync(downloadPath, { recursive: true, force: true });
    mkdirSync(downloadPath, { recursive: true });

    try {
        installed = JSON.parse(readFileSync(manifestPath, "utf8"));
    } catch {
        for (const coreModule of CORE_MODULES) {
            installed[`discord_${coreModule}`] = { installedVersion: 0 };
        }
    }

    hostUpdater = getHostUpdater();

    // @ts-ignore
    hostUpdater.on("update-progress", (progress: number) =>
        events.emit("downloading-module", { name: "host", progress }),
    );

    // @ts-ignore
    hostUpdater.on("update-manually", (e: unknown) => events.emit("manual", e));

    hostUpdater.on("update-downloaded", hostUpdater.quitAndInstall);

    hostUpdater.on("error", () => {
        log("module-updater", "Failed to update host.");
        events.emit("checked", { failed: true });
    });

    const platform = process.platform === "darwin" ? "osx" : "linux";
    baseUrl = `${endpoint}/modules/${releaseChannel}`;
    queryString = `?host_version=${version}&platform=${platform}`;
    hostUpdater.setFeedURL({
        url: `${endpoint}/updates/${releaseChannel}?platform=${platform}&version=${version}`,
    });
}

async function checkModules(): Promise<number> {
    remote = JSON.parse(
        (
            await requestUrl(
                `${assertNotNull(baseUrl)}/versions.json${assertNotNull(
                    queryString,
                )}`,
            )
        )[1],
    );

    for (const name in installed) {
        const installedVersion = installed[name].installedVersion;
        const remoteVersion = remote[name];

        if (installedVersion !== remoteVersion) {
            log(
                "module-updater",
                "Update available:",
                name,
                installedVersion,
                "->",
                remoteVersion,
            );

            await downloadModule(name, remoteVersion);
        }
    }

    return downloading.total;
}

async function downloadModule(name: string, version: number) {
    downloading.total++;

    const path = join(assertNotNull(downloadPath), `${name}-${version}.zip`);
    const file = createWriteStream(path);

    let success = false;
    let total = 0;
    let current = 0;
    const res = await redirectUrl(
        `${baseUrl}/${name}/${version}${queryString}`,
    );
    success = res.statusCode === 200;
    total = Number.parseInt(res.headers["content-length"] ?? "1", 10);

    res.pipe(file);

    res.on("data", (c) => {
        current += c.length;

        events.emit("downloading-module", { name, cur: current, total });
    });

    await new Promise((res) => file.on("close", res));

    if (success) {
        commitManifest();
    } else {
        downloading.fail++;
    }

    events.emit("downloaded-module", { name });

    downloading.done++;

    if (downloading.done === downloading.total) {
        events.emit("downloaded", { failed: downloading.fail });
    }

    await installModule(name, version, path);
}

async function installModule(name: string, version: number, path: string) {
    installing.total++;

    let err = false;
    const onErr = (e: Error) => {
        if (err) {
            return;
        }

        err = true;
        log("module-updater", "Failed to install module:", name, e);
        finishInstall(name, version, false);
    };

    let total = 0;
    let current = 0;
    execFile("unzip", ["-l", path], (_e, o) => {
        total = Number.parseInt(
            o.toString().match(/([0-9]+) files/)?.[1] ?? "0",
        );
    });

    const ePath = join(assertNotNull(basePath), name);
    mkdirSync(ePath, { recursive: true });

    const proc = execFile("unzip", ["-o", path, "-d", ePath]);

    proc.on("error", (e) => {
        // @ts-ignore
        if (e.code === "ENOENT") {
            dialog.showErrorBox("Error", "Please install 'unzip'");
            exit(1);
        }

        onErr(e);
    });

    proc.stderr?.on("data", onErr);
    proc.stdout?.on("data", (x) => {
        current += x.toString().split("\n").length;
        events.emit("installing-module", { name, cur: current, total });
    });

    proc.on("close", () => {
        if (err) {
            return;
        }

        installed[name] = { installedVersion: version };
        commitManifest();

        finishInstall(name, version, true);
    });
}

function finishInstall(name: string, version: number, success: boolean) {
    if (!success) {
        installing.fail++;
    }

    events.emit("installed-module", { name, succeeded: true });

    installing.done++;
    log("module-updater", "Installed module:", name, version);

    if (installing.done === downloading.total) {
        if (!installing.fail) {
            lastUpdateCheckTimestamp = Date.now();
        }

        events.emit("installed", { failed: installing.fail });
        resetTrackedOperations();
    }
}

function commitManifest() {
    writeFileSync(
        assertNotNull(manifestPath),
        JSON.stringify(installed, null, 2),
    );
}

/**
 * Checks for updates.
 */
export async function checkForUpdates() {
    log("module-updater", "Checking for updates...");

    const done = (e = {}) => events.emit("checked", e);

    if (lastUpdateCheckTimestamp > Date.now() - 10000) {
        return done();
    }

    const promises = [];
    if (!skipHost) {
        promises.push(
            new Promise((res) =>
                hostUpdater?.once("update-not-available", res),
            ),
        );
    }

    if (!skipModule) {
        promises.push(checkModules());
    }

    done({ count: (await Promise.all(promises)).pop() });
}

export function quitAndInstallUpdates() {
    hostUpdater?.quitAndInstall();
}

export function isInstalled(name: string, version: number) {
    return installed[name]?.installedVersion === version;
}

export function getInstalled(): Record<string, { installedVersion: number }> {
    return { ...installed };
}

export function install(name: string, def: boolean, version: number): void {
    if (isInstalled(name, version)) {
        if (!def) {
            events.emit("installed-module", { name, succeeded: true });
        }

        return;
    }

    if (def) {
        installed[name] = { installedVersion: 0 };
        commitManifest();
        return;
    }

    downloadModule(name, version ?? remote[name] ?? 0);
}

function requestUrl(url: string): Promise<[IncomingMessage, string]> {
    return new Promise((res) =>
        get(url, (response) => {
            let data = "";
            response.on("data", (chunk) => {
                data += chunk.toString();
            });
            response.on("end", () => {
                res([response, data]);
            });
        }),
    );
}

function redirectUrl(url: string): Promise<IncomingMessage> {
    return new Promise((res) =>
        get(url, (response) => {
            const location = response.headers.location;
            if (location) {
                return redirectUrl(location).then(res);
            }

            res(response);
        }),
    );
}
