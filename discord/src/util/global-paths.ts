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

// This implements a helper function and a fix for the below issue:
// https://github.com/electron/electron/issues/33504

import { Module } from "node:module";

const paths: string[] = [];

/**
 * Patches the Node module loader to include the global paths.
 */
export function installGlobalPathFix(): void {
    // @ts-ignore
    const nodeModulePaths = Module._nodeModulePaths;

    // @ts-ignore
    Module._nodeModulePaths = (from: string) => {
        nodeModulePaths(from).concat(paths);
    };
}

/**
 * Includes a global path in the module loader.
 * @param path The path.
 */
export function addGlobalPath(path: string): void {
    if (paths.includes(path)) {
        return;
    }

    // @ts-ignore
    Module.globalPaths.push(path);
    paths.push(path);
}
