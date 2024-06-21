import { Module } from "node:module";
import type { CaesarBuildInfo } from "../util/build-info";
import { log } from "../util/logging";
import { addGlobalPath } from "../util/global-paths";
import { join } from "node:path";
import { getVersionedUserDataPath } from "../util/paths";

//#region Module updater listening

/**
 * Listens for and responds to changes in the module updater's status.
 */
export interface IModuleUpdateListener {
    onUpdateManually?(): void;
    onUpdateCheckFinished?(): void;
    onNoPendingUpdates?(): void;
    onInstallingModuleProgress?(): void;
    onInstallingModulesFinished?(): void;
    onInstallingModule?(): void;
    onInstalledModule?(): void;
    onDownloadingModulesFinished?(): void;
    onDownloadingModule?(): void;
    onDownloadedModule?(): void;
    onCheckingForUpdates?(): void;
}

const listeners: IModuleUpdateListener[] = [];

export function addListener(listener: IModuleUpdateListener): void {
    listeners.push(listener);
}

export function removeListener(listener: IModuleUpdateListener): void {
    const index = listeners.indexOf(listener);
    if (index !== -1) {
        listeners.splice(index, 1);
    }
}

//#endregion

let locallyInstalledModules: boolean;
let moduleInstallPath: string | undefined = undefined;

function initialized(): boolean {
    return locallyInstalledModules || moduleInstallPath !== undefined;
}

export function initialize(
    buildInfo: CaesarBuildInfo,
    pathsOnly: boolean,
): void {
    if (initialized()) {
        log(
            "module-updater",
            "Initialize called despite already being initialized, skipping!",
        );
    }

    const logExtra = pathsOnly ? " (paths only) " : " ";
    log(
        "module-updater",
        `Initializing module updater${logExtra}with build info:`,
        buildInfo,
    );

    if (buildInfo.localModulesRoot !== undefined) {
        locallyInstalledModules = true;
        addGlobalPath(buildInfo.localModulesRoot);
    } else {
        const versionedUserDataPath = getVersionedUserDataPath();
        if (versionedUserDataPath === undefined) {
            // unreachable
            throw new Error(
                "Cannot initialize module updater without a versioned user data path",
            );
        }

        moduleInstallPath = join(versionedUserDataPath, "modules");
        addGlobalPath(moduleInstallPath);
    }

    if (pathsOnly) {
        return;
    }
}

export function checkForUpdates(): void {}

export function getInstalled(): void {}

export function install(): void {}

export function isInstalled(): void {}

export function quitAndInstallUpdates(): void {}

export function setInBackground(): void {}
