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

/*
 * Entrypoint of the bootstrapper, handles initialization.
 */

import { log, timerStart, timerEnd } from "./util/logging";
import { Timer } from "./util/logging/timer";
import { getBuildInfo, initBuildInfo } from "./util/build-info";
import { initializePaths } from "./util/paths";
import { getAppMode } from "./launch/app-mode";
import { installGlobalPathFix } from "./util/global-paths";

timerStart(Timer.Initialization);
{
    installGlobalPathFix();

    initBuildInfo();
    log("init", "Got buildInfo:", getBuildInfo());

    initializePaths(getBuildInfo());

    const mode = getAppMode();
    log("init", `Running in app mode: '${mode.name}'`);
    mode.execute();
}
timerEnd(Timer.Initialization);
