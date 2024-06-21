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

import { app } from "electron";
import type { IAppMode } from "./app-mode";
import { getBuildInfo } from "../util/build-info";
import { getSettings } from "../config/app-settings";

/**
 * The bootstrap application mode.
 */
export class BootstrapAppMode implements IAppMode {
    name = "bootstrap";

    execute(): void {
        if (
            process.platform === "linux" &&
            process.env.PULSE_LATENCY_MSEC === undefined
        ) {
            // @ts-ignore
            process.env.PULSE_LATENCY_MSEC = 30;
        }

        const buildInfo = getBuildInfo();
        const settings = getSettings();

        // @ts-ignore
        app.setVersion(buildInfo.version);
        // @ts-ignore
        global.releaseChannel = buildInfo.releaseChannel;

        app.setAppUserModelId(require("../Constants").APP_ID);

        loadCommandSwitches();

        if (!settings.getWithDefaultValue("enableHardwareAcceleration", true)) {
            app.disableHardwareAcceleration();
        }
    }
}

const commandSwitches = [
    "--autoplay-policy=no-user-gesture-required",
    "--disable-features=WinRetrieveSuggestionsOnlyOnDemand,HardwareMediaKeyHandling,MediaSessionService",
];

// --enable-gpu-rasterization --enable-zero-copy --ignore-gpu-blocklist --enable-hardware-overlays=single-fullscreen,single-on-top,underlay --enable-features=EnableDrDc,CanvasOopRasterization,BackForwardCache:TimeToLiveInBackForwardCacheInSeconds/300/should_ignore_blocklists/true/enable_same_site/true,ThrottleDisplayNoneAndVisibilityHiddenCrossOriginIframes,UseSkiaRenderer,WebAssemblyLazyCompilation --disable-features=Vulkan --force_high_performance_gpu
// '--enable-features=TurnOffStreamingMediaCachingOnBattery --force_low_power_gpu'

function loadCommandSwitches(): void {
    for (const switchArg of commandSwitches) {
        const parts = switchArg.split("=");
        if (parts.length !== 2) {
            throw new Error(`Invalid command switch: ${switchArg}`);
        }

        const [switchName, switchValue] = parts;
        app.commandLine.appendSwitch(switchName.replace("--", ""), switchValue);
    }
}
