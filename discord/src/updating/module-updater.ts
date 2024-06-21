import { Module } from "node:module";
import type { CaesarBuildInfo } from "../util/build-info";
import { log } from "../util/logging";
import { addGlobalPath } from "../util/global-paths";
import { join } from "node:path";
import {
    getResourcesPath,
    getUserDataPath,
    getVersionedUserDataPath,
} from "../util/paths";
import { mkdirSync, readFileSync } from "node:fs";

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

export class ModuleUpdater {
    endpoint: string;
    releaseChannel: string;
    version: string;
    buildInfo: CaesarBuildInfo;

    bootstrapping: boolean;
    hostUpdateAvailable: boolean;
    checkingForUpdates: boolean;

    skipHostUpdate: boolean;
    skipModuleUpdate: boolean;

    localModuleVersionsFilePath: string;
    bootstrapManifestFilePath: string;

    installedModulesFilePath: string | undefined;
    moduleDownloadPath: string | undefined;

    installedModules: unknown[] = [];

    listeners: IModuleUpdateListener[] = [];

    constructor(
        endpoint: string,
        releaseChannel: string,
        version: string,
        buildInfo: CaesarBuildInfo,
    ) {
        this.endpoint = endpoint;
        this.releaseChannel = releaseChannel;
        this.version = version;
        this.buildInfo = buildInfo;

        this.bootstrapping = false;
        this.hostUpdateAvailable = false;
        this.checkingForUpdates = false;

        this.skipHostUpdate = false; // TODO: settings.get(SKIP_HOST_UPDATE)
        this.skipModuleUpdate = false; // TODO: settings.get(SKIP_MODULE_UPDATE)

        const userDataPath = getUserDataPath();
        if (!userDataPath) {
            // unreachable
            throw new Error(
                "Cannot initialize module updater without a user data path",
            );
        }
        this.localModuleVersionsFilePath = join(
            userDataPath,
            "local_module_versions.json",
        );

        const resourcesPath = getResourcesPath();
        if (!resourcesPath) {
            // unreachable
            throw new Error(
                "Cannot initialize module updater without a resources path",
            );
        }
        this.bootstrapManifestFilePath = join(resourcesPath, "manifest.json");
    }

    initialize() {
        log("module-updater", "Initializing modules...");
        log(
            "module-updater",
            `Distribution: ${locallyInstalledModules ? "local" : "remote"}`,
        );
        log(
            "module-updater",
            `Host updates: ${this.skipHostUpdate ? "disabled" : "enabled"}`,
        );
        log(
            "module-updater",
            `Module updates: ${this.skipModuleUpdate ? "disabled" : "enabled"}`,
        );

        if (!locallyInstalledModules) {
            if (moduleInstallPath === undefined) {
                // unreachable
                throw new Error(
                    "Cannot initialize module updater without a module install path",
                );
            }

            this.installedModulesFilePath = join(
                moduleInstallPath,
                "installed.json",
            );
            this.moduleDownloadPath = join(moduleInstallPath, "pending");

            mkdirSync(this.moduleDownloadPath, { recursive: true });

            log("module-updater", `Module install path: ${moduleInstallPath}`);
            log(
                "module-updater",
                `Module installed file path: ${this.installedModulesFilePath}`,
            );
            log(
                "module-updater",
                `Module download path: ${this.moduleDownloadPath}`,
            );

            let failed = false;
            try {
                this.installedModules = JSON.parse(
                    readFileSync(this.installedModulesFilePath, "utf-8"),
                );
            } catch (err) {
                failed = true;
            }

            this.bootstrapping =
                failed; /* || settings.get(ALWAYS_BOOTSTRAP_MODULES); */ // TODO
        }
    }

    addListener(listener: IModuleUpdateListener): void {
        this.listeners.push(listener);
    }

    removeListener(listener: IModuleUpdateListener): void {
        const index = this.listeners.indexOf(listener);
        if (index !== -1) {
            this.listeners.splice(index, 1);
        }
    }
}

let locallyInstalledModules: boolean;
let moduleInstallPath: string | undefined = undefined;

function initialized(): boolean {
    return locallyInstalledModules || moduleInstallPath !== undefined;
}

export function initializeModuleUpdaterPaths(buildInfo: CaesarBuildInfo): void {
    if (initialized()) {
        log(
            "module-updater",
            "Initialize called despite already being initialized, skipping!",
        );
    }

    log(
        "module-updater",
        "Initializing module updater paths with build info:",
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
}

export function createModuleUpdater(
    endpoint: string,
    releaseChannel: string,
    version: string,
    buildInfo: CaesarBuildInfo,
): ModuleUpdater {
    const updater = new ModuleUpdater(
        endpoint,
        releaseChannel,
        version,
        buildInfo,
    );

    return updater;
}

export function checkForUpdates(): void {}

export function getInstalled(): void {}

export function install(): void {}

export function isInstalled(): void {}

export function quitAndInstallUpdates(): void {}

export function setInBackground(): void {}
