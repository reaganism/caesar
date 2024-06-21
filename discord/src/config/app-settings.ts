import { readFileSync, statSync, writeFileSync } from "node:fs";
import { log } from "../util/logging";
import { join } from "node:path";
import { getUserDataPath } from "../util/paths";

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

    public save(): void {
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

    getLastModifiedTime() {
        try {
            return statSync(this.path).mtimeMs;
        } catch {
            return this.lastModified;
        }
    }
}

let settings: Settings | undefined;

export function getSettings() {
    const userDataPath = getUserDataPath();
    if (userDataPath === undefined) {
        // unreachable
        throw new Error("User data path is undefined");
    }

    settings = settings ?? new Settings(join(userDataPath, "settings.json"));
    return settings;
}
