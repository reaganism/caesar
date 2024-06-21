import { initializeModuleUpdaterPaths } from "../update/module-updater";
import { getBuildInfo } from "../util/build-info";
import type { IAppMode } from "./app-mode";

export class OverlayHostAppMode implements IAppMode {
    name = "overlay-host";

    execute(): void {
        // appSettings.init()
        // if !buildInfo.debug && buildInfo.newUpdater
        //     if !updater.tryInitUpdater
        //         throw
        //     upadter.getUpdater().startCurrentVersionSync()
        // else
        //     moduleUpdater.initialize(buildInfo, true)

        const buildInfo = getBuildInfo();
        if (!buildInfo.debug && buildInfo.newUpdater) {
        } else {
            initializeModuleUpdaterPaths(buildInfo);
        }

        // Provided by Discord.
        require("discord_overlay2/standalone_host.js");
    }
}
