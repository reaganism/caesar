import { basename, dirname, join } from "path";
import buildInfo, { BuildInfo } from "./buildInfo";
import { log } from "./logging";
import { app } from "electron";
import { lstatSync, mkdirSync, readdirSync, rmdirSync } from "fs";

let resourcesPath: string | undefined;
let userDataPath: string | undefined;
let versionedUserDataPath: string | undefined;
let moduleDataPath: string | undefined;
let installPath: string | undefined;

export function initialize(buildInfo: BuildInfo) {
    resourcesPath = join(require.main.filename, "..", "..", "..");
    userDataPath = findUserDataDir(findAppDataDir(), buildInfo);
    versionedUserDataPath = join(userDataPath, buildInfo.version);
    moduleDataPath =
        buildInfo.localModulesRoot || buildInfo.newUpdater
            ? join(userDataPath, "module_data")
            : join(versionedUserDataPath, "modules");

    const exeDir = dirname(app.getPath("exe"));
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
}

export function removeOldInstallations() {
    if (!userDataPath) {
        log("paths", "userDataPath not set, cannot remove old installations");
        return;
    }

    log("paths", "Removing old installations");

    const entries = readdirSync(userDataPath);
    entries.forEach((entry) => {
        const fullPath = join(userDataPath, entry);
        try {
            const stat = lstatSync(fullPath);

            if (!stat.isDirectory()) {
                return;
            }

            if (entry.indexOf(buildInfo.version) !== -1) {
                return;
            }

            if (!entry.match("^[0-9]+.[0-9]+.[0-9]+")) {
                return;
            }

            log("paths", "Found old installation, removing", fullPath);

            rmdirSync(fullPath, { recursive: true });
        } catch (e) {
            log("paths", "Failed to remove old installation", fullPath, e);
            return;
        }
    });
}

export function getInstallPath() {
    return installPath;
}

export function getModuleDataPath() {
    return moduleDataPath;
}

export function getResourcesPath() {
    return resourcesPath;
}

export function getUserDataPath() {
    return userDataPath;
}

export function getVersionedUserDataPath() {
    return versionedUserDataPath;
}

function findAppDataDir(): string {
    const userDataPath = process.env.DISCORD_USER_DATA_DIR;
    if (userDataPath) {
        return userDataPath;
    }

    return app.getPath("appData");
}

function findUserDataDir(userDataRoot: string, buildInfo: BuildInfo): string {
    // TODO: Determine when to use caesar instead of discord?
    return join(
        userDataRoot,
        "discord" + buildInfo.releaseChannel === "stable"
            ? ""
            : buildInfo.releaseChannel,
    );
}
