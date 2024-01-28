import { Timer, log, timerStart, timerEnd } from "./util/logging";

timerStart(Timer.Initialization);
log("test", "test");
timerEnd(Timer.Initialization);
