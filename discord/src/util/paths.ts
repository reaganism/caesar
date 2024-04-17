import { basename, dirname, join } from 'node:path';
import { lstatSync, mkdirSync, readdirSync, rmdirSync } from 'node:fs';
import { app } from 'electron';
import { type CaesarBuildInfo } from './build-info';
import { log } from './logging';

let resourcesPath: string | undefined;
let userDataPath: string | undefined;
let versionedUserDataPath: string | undefined;
let moduleDataPath: string | undefined;
let installPath: string | undefined;

export function initializePaths(buildInfo: CaesarBuildInfo): void {
    if (!require.main)
        throw new Error('Cannot initialize paths without a main module');

    resourcesPath = join(require.main.filename, '..', '..', '..');
    userDataPath = findUserDataDir(findAppDataDir(), buildInfo);
    versionedUserDataPath = join(userDataPath, buildInfo.version);
    moduleDataPath =
        buildInfo.localModulesRoot ?? buildInfo.newUpdater
            ? join(userDataPath, 'module_data')
            : join(versionedUserDataPath, 'modules');

    const exeDir = dirname(app.getPath('exe'));
    if (/^app-[0-9]+\.[0-9]+\.[0-9]+/.test(basename(exeDir))) {
        installPath = join(exeDir, 'resources');
    }

    app.setPath('userData', userDataPath);
    mkdirSync(userDataPath, { recursive: true });

    log('paths', 'resourcesPath:', resourcesPath);
    log('paths', 'userDataPath:', userDataPath);
    log('paths', 'userDataVersionedPath:', versionedUserDataPath);
    log('paths', 'moduleDataPath:', moduleDataPath);
    log('paths', 'installPath:', installPath);
}

export function removeOldInstallations(buildInfo: CaesarBuildInfo): void {
    if (!userDataPath) {
        log('paths', 'userDataPath not set, cannot remove old installations');
        return;
    }

    log('paths', 'Removing old installations');

    const entries = readdirSync(userDataPath);
    entries.forEach((entry) => {
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

            log('paths', 'Found old installation, removing', fullPath);

            rmdirSync(fullPath, { recursive: true });
        } catch (e) {
            log('paths', 'Failed to remove old installation', fullPath, e);
            return;
        }
    });
}

export function getInstallPath(): string | undefined {
    return installPath;
}

export function getModuleDataPath(): string | undefined {
    return moduleDataPath;
}

export function getResourcesPath(): string | undefined {
    return resourcesPath;
}

export function getUserDataPath(): string | undefined {
    return userDataPath;
}

export function getVersionedUserDataPath(): string | undefined {
    return versionedUserDataPath;
}

function findAppDataDir(): string {
    userDataPath = process.env.DISCORD_USER_DATA_DIR;
    if (userDataPath) {
        return userDataPath;
    }

    return app.getPath('appData');
}

function findUserDataDir(
    userDataRoot: string,
    buildInfo: CaesarBuildInfo,
): string {
    // TODO: Determine when to use caesar instead of discord?
    return join(
        userDataRoot,
        `discord${buildInfo.releaseChannel}` === 'stable'
            ? ''
            : buildInfo.releaseChannel,
    );
}
