/* Copyright (C) 2024  Tomat et al.
 * Copyright (C) 2023  GooseNest
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

import { readFileSync } from "node:fs";
import type { CaesarBuildInfo } from "../util/build-info";
import {
    getExecutableDir,
    getInstallPath,
    getUserDataPath,
} from "../util/paths";
import { log } from "../util/logging";
import { assertNotNull } from "../util/validation";
import EventEmitter from "node:events";
import { basename, join, resolve } from "node:path";
import { app } from "electron";
import { spawn } from "node:child_process";
import { Module } from "node:module";

export const TASK_STATE_COMPLETE = "Complete";
export const TASK_STATE_FAILED = "Failed";
export const TASK_STATE_WAITING = "Waiting";
export const TASK_STATE_WORKING = "Working";

export const INCONSISTENT_INSTALLER_STATE_ERROR = "InconsistentInstallerState";

type UpdaterOptions = {
    release_channel: string;
    platform: string;
    repository_url: string;
    root_path: string;
    user_data_path: string;
    current_os_arch: string | null;
};

export class Updater extends EventEmitter {
    committedHostVersion: unknown;
    rootPath: string | unknown;
    nextRequestId: unknown;
    requests: unknown;
    updateEventHistory: unknown;
    currentlyDownloading: unknown;
    currentlyInstalling: unknown;
    hasEmittedUnhandledException: unknown;
    nativeUpdater: unknown;

    constructor(options: UpdaterOptions) {
        super();

        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        let Native: unknown & { Updater: any };
        try {
            // @ts-ignore
            Native = options.nativeUpdaterModule ?? require(updaterPath);
        } catch (e) {
            log("updater", "Failed to load updater module:", e);

            // @ts-ignore
            if (e.code === "MODULE_NOT_FOUND") {
                return;
            }
            throw e;
        }

        this.committedHostVersion = null;
        this.rootPath = options.root_path;
        this.nextRequestId = 0;
        this.requests = new Map();
        this.updateEventHistory = [];
        this.currentlyDownloading = {};
        this.currentlyInstalling = {};
        this.hasEmittedUnhandledException = false;

        this.nativeUpdater = new Native.Updater({
            // @ts-ignore
            response_handler: this._handleResponse.bind(this),
            ...options,
        });
    }

    get valid() {
        return this.nativeUpdater !== null;
    }

    _sendRequest(detail: unknown, progressCallback: unknown = null) {
        if (!this.valid) {
            throw new Error("Updater is not valid (no native)");
        }

        // @ts-ignore
        const requestId = this.nextRequestId++;
        return new Promise((resolve, reject) => {
            // @ts-ignore
            this.requests.set(requestId, { resolve, reject, progressCallback });
            // @ts-ignore
            this.nativeUpdater.command(JSON.stringify([requestId, detail]));
        });
    }

    _sendRequestSync(detail: unknown) {
        if (!this.valid) {
            throw new Error("Updater is not valid (no native)");
        }

        // @ts-ignore
        return this.nativeUpdater.command_blocking(
            // @ts-ignore
            JSON.stringify([this.nextRequestId++, detail]),
        );
    }

    _handleResponse(response: unknown) {
        try {
            // @ts-ignore
            const [id, detail] = JSON.parse(response);
            // @ts-ignore
            const request = this.requests.get(id);

            if (request == null) return log("Updater", id, detail); // No request handlers for id / type

            if (detail.Error != null) {
                const { kind, details, severity } = detail.Error;
                const e = new Error(`(${kind}) ${details}`);

                if (severity === "Fatal") {
                    if (!this.emit(kind, e)) throw e;
                } else {
                    this.emit("update-error", e);
                    request.reject(e);
                    // @ts-ignore
                    this.requests.delete(id);
                }
            } else if (detail === "Ok") {
                request.resolve();
                // @ts-ignore
                this.requests.delete(id);
            } else if (detail.VersionInfo != null) {
                request.resolve(detail.VersionInfo);
                // @ts-ignore
                this.requests.delete(id);
            } else if (detail.ManifestInfo != null) {
                request.resolve(detail.ManifestInfo);
                // @ts-ignore
                this.requests.delete(id);
            } else if (detail.TaskProgress != null) {
                const msg = detail.TaskProgress;
                const progress = {
                    task: msg[0],
                    state: msg[1],
                    percent: msg[2],
                    bytesProcessed: msg[3],
                };

                this._recordTaskProgress(progress);

                request.progressCallback?.(progress);

                if (
                    progress.task.HostInstall != null &&
                    progress.state === TASK_STATE_COMPLETE
                )
                    this.emit("host-updated");
            } else log("Updater", id, detail); // Unknown response
        } catch (e) {
            log("Updater", e); // Error handling response

            if (!this.hasEmittedUnhandledException) {
                this.hasEmittedUnhandledException = true;
                this.emit("unhandled-exception", e);
            }
        }
    }

    _handleSyncResponse(response: unknown) {
        // @ts-ignore
        const detail = JSON.parse(response);

        if (detail.Error != null) throw detail.Error;
        if (detail === "Ok") return;
        if (detail.VersionInfo != null) return detail.VersionInfo;

        log("Updater", detail); // Unknown response
    }

    _getHostPath() {
        return join(
            // @ts-ignore
            this.rootPath,
            // @ts-ignore
            `app-${this.committedHostVersion.join(".")}`,
        );
    }

    _startCurrentVersionInner(options: unknown, versions: unknown) {
        if (this.committedHostVersion == null)
            // @ts-ignore
            this.committedHostVersion = versions.current_host;

        const cur = resolve(process.execPath);
        const next = resolve(
            join(this._getHostPath(), basename(process.execPath)),
        );

        // @ts-ignore
        // biome-ignore lint/suspicious/noDoubleEquals: <explanation>
        if (next != cur && !options?.allowObsoleteHost) {
            // Retain OpenAsar
            const fs = require("original-fs");

            // @ts-ignore
            const cAsar = join(require.main.filename, "..");
            const nAsar = join(next, "..", "resources", "app.asar");

            try {
                fs.copyFileSync(nAsar, `${nAsar}.backup`); // Copy new app.asar to backup file (<new>/app.asar -> <new>/app.asar.backup)
                fs.copyFileSync(cAsar, nAsar); // Copy old app.asar to new app.asar (<old>/app.asar -> <new>/app.asar)
            } catch (e) {
                log("Updater", "Failed to retain OpenAsar", e);
            }

            app.once("will-quit", () =>
                spawn(next, [], {
                    detached: true,
                    stdio: "inherit",
                }),
            );

            log("Updater", "Restarting", next);
            return app.quit();
        }

        this._commitModulesInner(versions);
    }

    _commitModulesInner(versions: unknown) {
        const base = join(this._getHostPath(), "modules");

        // @ts-ignore
        for (const m in versions.current_modules) {
            // @ts-ignore
            Module.globalPaths.unshift(
                // @ts-ignore
                join(base, `${m}-${versions.current_modules[m]}`),
            );
        }
    }

    _recordDownloadProgress(name: unknown, progress: unknown) {
        // @ts-ignore
        const now = String(hrtime.bigint());

        if (
            // @ts-ignore
            progress.state === TASK_STATE_WORKING &&
            // @ts-ignore
            !this.currentlyDownloading[name]
        ) {
            // @ts-ignore
            this.currentlyDownloading[name] = true;
            // @ts-ignore
            this.updateEventHistory.push({
                type: "downloading-module",
                name,
                now,
            });
        } else if (
            // @ts-ignore
            progress.state === TASK_STATE_COMPLETE ||
            // @ts-ignore
            progress.state === TASK_STATE_FAILED
        ) {
            // @ts-ignore
            this.currentlyDownloading[name] = false;
            // @ts-ignore
            this.updateEventHistory.push({
                type: "downloaded-module",
                name,
                now,
                // @ts-ignore
                succeeded: progress.state === TASK_STATE_COMPLETE,
                // @ts-ignore
                receivedBytes: progress.bytesProcessed,
            });
        }
    }

    _recordInstallProgress(
        name: unknown,
        progress: unknown,
        newVersion: unknown,
        isDelta: unknown,
    ) {
        // @ts-ignore
        const now = String(hrtime.bigint());

        if (
            // @ts-ignore
            progress.state === TASK_STATE_WORKING &&
            // @ts-ignore
            !this.currentlyInstalling[name]
        ) {
            // @ts-ignore
            this.currentlyInstalling[name] = true;
            // @ts-ignore
            this.updateEventHistory.push({
                type: "installing-module",
                name,
                now,
                newVersion,
            });
        } else if (
            // @ts-ignore
            progress.state === TASK_STATE_COMPLETE ||
            // @ts-ignore
            progress.state === TASK_STATE_FAILED
        ) {
            // @ts-ignore
            this.currentlyInstalling[name] = false;
            // @ts-ignore
            this.updateEventHistory.push({
                type: "installed-module",
                name,
                now,
                newVersion,
                // @ts-ignore
                succeeded: progress.state === TASK_STATE_COMPLETE,
                delta: isDelta,
            });
        }
    }

    _recordTaskProgress(progress: unknown) {
        // @ts-ignore
        if (progress.task.HostDownload != null)
            this._recordDownloadProgress("host", progress);
        // @ts-ignore
        else if (progress.task.HostInstall != null)
            this._recordInstallProgress(
                "host",
                progress,
                null,
                // @ts-ignore
                progress.task.HostInstall.from_version != null,
            );
        // @ts-ignore
        else if (progress.task.ModuleDownload != null)
            this._recordDownloadProgress(
                // @ts-ignore
                progress.task.ModuleDownload.version.module.name,
                progress,
            );
        // @ts-ignore
        else if (progress.task.ModuleInstall != null)
            this._recordInstallProgress(
                // @ts-ignore
                progress.task.ModuleInstall.version.module.name,
                progress,
                // @ts-ignore
                progress.task.ModuleInstall.version.version,
                // @ts-ignore
                progress.task.ModuleInstall.from_version != null,
            );
    }

    constructQueryCurrentVersionsRequest(options: unknown) {
        if (updaterVersion === 1) return "QueryCurrentVersions";

        return {
            QueryCurrentVersions: {
                options,
            },
        };
    }

    queryCurrentVersionsWithOptions(options: unknown) {
        return this._sendRequest(
            this.constructQueryCurrentVersionsRequest(options),
        );
    }
    queryCurrentVersions() {
        return this.queryCurrentVersionsWithOptions(null);
    }

    queryCurrentVersionsWithOptionsSync(options: unknown) {
        return this._handleSyncResponse(
            this._sendRequestSync(
                this.constructQueryCurrentVersionsRequest(options),
            ),
        );
    }
    queryCurrentVersionsSync() {
        return this.queryCurrentVersionsWithOptionsSync(null);
    }

    repair(progressCallback: unknown) {
        return this.repairWithOptions(null, progressCallback);
    }

    repairWithOptions(options: unknown, progressCallback: unknown) {
        return this._sendRequest(
            {
                Repair: {
                    options,
                },
            },
            progressCallback,
        );
    }

    collectGarbage() {
        return this._sendRequest("CollectGarbage");
    }

    setRunningManifest(manifest: unknown) {
        return this._sendRequest({
            SetManifests: ["Running", manifest],
        });
    }

    setPinnedManifestSync(manifest: unknown) {
        return this._handleSyncResponse(
            this._sendRequestSync({
                SetManifests: ["Pinned", manifest],
            }),
        );
    }

    installModule(name: unknown, progressCallback: unknown) {
        return this.installModuleWithOptions(name, null, progressCallback);
    }

    installModuleWithOptions(
        name: unknown,
        options: unknown,
        progressCallback: unknown,
    ) {
        return this._sendRequest(
            {
                InstallModule: {
                    name,
                    options,
                },
            },
            progressCallback,
        );
    }

    updateToLatest(progressCallback: unknown) {
        return this.updateToLatestWithOptions(null, progressCallback);
    }

    updateToLatestWithOptions(options: unknown, progressCallback: unknown) {
        return this._sendRequest(
            {
                UpdateToLatest: {
                    options,
                },
            },
            progressCallback,
        );
    }

    async startCurrentVersion(queryOptions: unknown, options: unknown) {
        const versions =
            await this.queryCurrentVersionsWithOptions(queryOptions);

        // @ts-ignore
        await this.setRunningManifest(versions.last_successful_update);

        this._startCurrentVersionInner(options, versions);
    }

    startCurrentVersionSync(options: unknown) {
        this._startCurrentVersionInner(
            options,
            this.queryCurrentVersionsSync(),
        );
    }

    async commitModules(queryOptions: unknown, versions: unknown) {
        if (this.committedHostVersion == null) throw "No host";

        this._commitModulesInner(
            versions ??
                (await this.queryCurrentVersionsWithOptions(queryOptions)),
        );
    }

    queryAndTruncateHistory() {
        const history = this.updateEventHistory;
        this.updateEventHistory = [];
        return history;
    }

    getKnownFolder(name: unknown) {
        if (!this.valid) throw "No native";

        // @ts-ignore
        return this.nativeUpdater.known_folder(name);
    }

    createShortcut(options: unknown) {
        if (!this.valid) throw "No native";

        // @ts-ignore
        return this.nativeUpdater.create_shortcut(options);
    }
}

let updater: Updater | undefined;
let updaterVersion = 1;
const updaterPath = assertNotNull(`${getExecutableDir()}/updater.node`);
const arch = ["AMD64", "IA64"].includes(
    process.env.PROCESSOR_ARCHITEW6432 ??
        process.env.PROCESSOR_ARCHITECTURE ??
        "",
)
    ? "x64"
    : "x86";

export function tryInitUpdater(
    buildInfo: CaesarBuildInfo,
    repositoryUrl: string,
): boolean {
    const rootPath = getInstallPath();
    if (rootPath === undefined) {
        return false;
    }

    const updaterContents = readFileSync(updaterPath, "utf-8");
    if (
        updaterContents.includes(
            "Determined this is an architecture transition",
        )
    ) {
        updaterVersion = 2;
    }

    log("updater", "Determined native module version:", updaterVersion);

    updater = new Updater({
        release_channel: buildInfo.releaseChannel,
        platform: process.platform === "win32" ? "win" : "osx",
        repository_url: repositoryUrl,
        root_path: rootPath,
        user_data_path: assertNotNull(getUserDataPath()),
        current_os_arch: process.platform === "win32" ? arch : null,
    });
    return updater.valid;
}

export function getUpdater(): Updater | null {
    if (updater === undefined || !updater.valid) {
        return null;
    }

    return updater;
}
