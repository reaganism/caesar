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
