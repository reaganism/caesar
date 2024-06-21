/* Copyright (C) 2024  Tomat et al.
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

import { basename, dirname, join } from "node:path";
import { lstatSync, mkdirSync, readdirSync, rmdirSync } from "node:fs";
import { app } from "electron";
import { getBuildInfo, type CaesarBuildInfo } from "./build-info";
import { log } from "./logging";

let resourcesPath: string | undefined;
let userDataPath: string | undefined;
let versionedUserDataPath: string | undefined;
let moduleDataPath: string | undefined;
let installPath: string | undefined;
let exeDir: string | undefined;

/**
 * Initializes paths.
 * @param buildInfo The build info to initialize within the context of.
 */
export function initializePaths(buildInfo: CaesarBuildInfo): void {
    if (!require.main)
        throw new Error("Cannot initialize paths without a main module");

    resourcesPath = join(require.main.filename, "..", "..", "..");
    userDataPath = findUserDataDir(findAppDataDir(), buildInfo);
    versionedUserDataPath = join(userDataPath, buildInfo.version);
    moduleDataPath =
        buildInfo.localModulesRoot ?? buildInfo.newUpdater
            ? join(userDataPath, "module_data")
            : join(versionedUserDataPath, "modules");

    exeDir = dirname(app.getPath("exe"));
    if (/^app-[0-9]+\.[0-9]+\.[0-9]+/.test(basename(exeDir))) {
        installPath = join(exeDir, "resources");
    }

    app.setPath("userData", userDataPath);
    mkdirSync(userDataPath, { recursive: true });

    log("paths", "resourcesPath:", resourcesPath);
    log("paths", "userDataPath:", userDataPath);
    log("paths", "userDataVersionedPath:", versionedUserDataPath);
    log("paths", "moduleDataPath:", moduleDataPath);
    log("paths", "installPath:", installPath);
    log("paths", "exeDir:", exeDir);
}

/**
 * Removes old (outdated) Discord installations.
 * @param buildInfo The build info.
 */
export function removeOldInstallations(buildInfo: CaesarBuildInfo): void {
    if (!userDataPath) {
        log("paths", "userDataPath not set, cannot remove old installations");
        return;
    }

    log("paths", "Removing old installations");

    const entries = readdirSync(userDataPath);
    for (const entry of entries) {
        if (!userDataPath) {
            return;
        }

        const fullPath = join(userDataPath, entry);
        try {
            const stat = lstatSync(fullPath);

            if (!stat.isDirectory()) {
                return;
            }

            if (entry.includes(buildInfo.version)) {
                return;
            }

            if (!/^[0-9]+.[0-9]+.[0-9]+/.exec(entry)) {
                return;
            }

            log("paths", "Found old installation, removing", fullPath);

            rmdirSync(fullPath, { recursive: true });
        } catch (e) {
            log("paths", "Failed to remove old installation", fullPath, e);
            return;
        }
    }
}

/**
 * @returns The path to which Discord is installed.
 */
export function getInstallPath(): string | undefined {
    return installPath;
}

/**
 * @returns The path to which module data is saved.
 */
export function getModuleDataPath(): string | undefined {
    return moduleDataPath;
}

/**
 * @returns The Electron `resources` directory.
 */
export function getResourcesPath(): string | undefined {
    return resourcesPath;
}

/**
 * @returns The user data `discord{releaseChannel}` directory.
 */
export function getUserDataPath(): string | undefined {
    return userDataPath;
}

/**
 * @returns The versioned sub-directory beneath the user data directory.
 */
export function getVersionedUserDataPath(): string | undefined {
    return versionedUserDataPath;
}

export function getExecutableDir(): string | undefined {
    return exeDir;
}

function findAppDataDir(): string {
    userDataPath = process.env.DISCORD_USER_DATA_DIR;
    if (userDataPath) {
        return userDataPath;
    }

    return app.getPath("appData");
}

function findUserDataDir(
    userDataRoot: string,
    buildInfo: CaesarBuildInfo,
): string {
    const appName = getBuildInfo().caesarStandalone ? "caesar" : "discord";
    return join(
        userDataRoot,
        appName +
            (buildInfo.releaseChannel === "stable"
                ? ""
                : buildInfo.releaseChannel),
    );
}
