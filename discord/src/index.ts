import { Timer, log, timerStart, timerEnd } from "./util/logging";

timerStart(Timer.Initialization);

import buildInfo from "./util/buildInfo";
log("init", "Got buildInfo:", buildInfo);

import * as paths from "./util/paths";
paths.initialize(buildInfo);

timerEnd(Timer.Initialization);
