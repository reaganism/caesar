import { Timer, log, time, timeEnd } from "./util/logging";

time(Timer.Initialization);
log("test", "test");
timeEnd(Timer.Initialization);
