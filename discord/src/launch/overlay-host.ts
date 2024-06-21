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

import type { IAppMode } from "./app-mode";

/**
 * The overlay host application mode.
 */
export class OverlayHostAppMode implements IAppMode {
    name = "overlay-host";

    execute(): void {
        /* appSettings.init()
         * if !buildInfo.debug && buildInfo.newUpdater
         *     if !updater.tryInitUpdater
         *         throw
         *     upadter.getUpdater().startCurrentVersionSync()
         * else
         *     moduleUpdater.initialize(buildInfo, true)
         */

        // Provided by Discord.
        require("discord_overlay2/standalone_host.js");
    }
}
