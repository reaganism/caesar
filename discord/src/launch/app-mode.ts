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

import { BootstrapAppMode } from "./bootstrap";
import { OverlayHostAppMode } from "./overlay-host";

/**
 * Handles different launch options and procedures.
 */
export interface IAppMode {
    /**
     * The name of the app mode.
     */
    name: string;

    /**
     * Executes the app mode task.
     */
    execute(): void;
}

let appMode: IAppMode | undefined;

/**
 * Gets (and initializes, if necessary) the app mode based on the launch
 * options.
 * @returns The app mode based on the launch options.
 */
export function getAppMode(): IAppMode {
    if (appMode) {
        return appMode;
    }

    appMode = process.argv.includes("--overlay-host")
        ? new OverlayHostAppMode()
        : new BootstrapAppMode();
    return appMode;
}
