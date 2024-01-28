import { existsSync } from "fs";
import path from "path";
import { log } from "./logging";

export type BuildInfo = {
    newUpdater: boolean;
    releaseChannel: string;
    version: string;
    localModulesRoot?: string;
};

let buildInfo: BuildInfo;

const buildInfoPath = path.join(process.resourcesPath, "build_info.json");
if (!existsSync(buildInfoPath)) {
    log("buildInfo", "build_info.json not found, using default build info");
    buildInfo = {
        newUpdater: true,
        releaseChannel: "canary",
        version: "1.0.266",
    };
} else {
    buildInfo = require(buildInfoPath);
}

export default buildInfo;
