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

import { readFileSync, statSync, writeFileSync } from "node:fs";
import { log } from "../util/logging";
import { join } from "node:path";
import { getUserDataPath } from "../util/paths";
import { assertNotNull } from "../util/validation";

/**
 * Provides application settings based on the original Discord desktop
 * bootstrapper.
 */
export class Settings {
    path: string;
    store: Record<string, unknown>;
    lastModified: number;

    constructor(path: string) {
        this.path = path;

        try {
            this.store = JSON.parse(readFileSync(path, "utf8"));
        } catch (err) {
            log("app-settings", `Failed to load settings: ${err}`);
            this.store = {};
        }

        this.lastModified = this.getLastModifiedTime();
    }

    get<T>(key: string): T {
        return this.store[key] as T;
    }

    set<T>(key: string, value: T): void {
        this.store[key] = value;
    }

    getLastModifiedTime() {
        try {
            return statSync(this.path).mtimeMs;
        } catch {
            return this.lastModified;
        }
    }

    save(): void {
        // We can't save the file if it's been modified externally.
        if (
            this.lastModified !== 0 &&
            this.lastModified !== this.getLastModifiedTime()
        ) {
            log(
                "app-settings",
                "Settings file has been modified externally, skipping save.",
            );
            return;
        }

        try {
            writeFileSync(this.path, JSON.stringify(this.store, null, 4));
            this.lastModified = this.getLastModifiedTime();

            log("app-settings", "Settings saved successfully.");
        } catch (err) {
            log("app-settings", `Failed to save settings: ${err}`);
        }
    }
}

let settings: Settings | undefined;

export function getSettings() {
    const userDataPath = assertNotNull(getUserDataPath());
    settings = settings ?? new Settings(join(userDataPath, "settings.json"));
    return settings;
}
