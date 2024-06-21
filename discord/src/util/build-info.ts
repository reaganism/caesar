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

import { join } from "node:path";
import { existsSync } from "node:fs";
import { log } from "./logging";
import { BUILD_VERSION } from "./constants";

//#region Types

/**
 * Build information included in a standard Discord installation.
 */
interface BuildInfo {
    newUpdater: boolean;
    releaseChannel: string;
    version: string;
    localModulesRoot?: string;
    debug?: boolean;
}

/**
 * Build information included in a Caesar installation.
 */
interface CaesarInfo {
    caesarStandalone: boolean;
}

/**
 * Complete, expectable build information.
 */
export type CaesarBuildInfo = BuildInfo & CaesarInfo;

//#endregion

let buildInfo: CaesarBuildInfo;

export function initBuildInfo(): void {
    const buildInfoPath = join(process.resourcesPath, "build_info.json");

    if (!existsSync(buildInfoPath)) {
        log(
            "build-info",
            `build_info.json not found (expected @ '${buildInfoPath}'), using default build info`,
        );

        buildInfo = {
            newUpdater: true,
            releaseChannel: "canary",
            version: BUILD_VERSION,
            debug: false,
            caesarStandalone: true,
        };
    } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- safe enough, we sanitize
        buildInfo = require(buildInfoPath);

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- unsanitized
        buildInfo.caesarStandalone ??= false;
    }
}

export function getBuildInfo(): CaesarBuildInfo {
    return buildInfo;
}
