import type { IAppMode } from "./app-mode";

export class OverlayHostAppMode implements IAppMode {
    name = "overlay-host";

    execute(): void {
        // Provided by Discord.
        require("discord_overlay2/standalone_host.js");
    }
}
