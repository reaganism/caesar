// https://github.com/electron/electron/issues/33504

import { Module } from "node:module";

const paths: string[] = [];

export function installGlobalPathFix(): void {
    // @ts-ignore
    const nodeModulePaths = Module._nodeModulePaths;

    // @ts-ignore
    Module._nodeModulePaths = (from: string) => {
        nodeModulePaths(from).concat(paths);
    };
}

export function addGlobalPath(path: string) {
    if (paths.includes(path)) {
        return;
    }

    // @ts-ignore
    Module.globalPaths.push(path);
    paths.push(path);
}
