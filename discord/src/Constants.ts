// Special file; referenced by libdiscord.

import { getSettings } from "./config/app-settings";
import { getBuildInfo } from "./util/build-info";

const settings = getSettings();
const buildInfo = getBuildInfo();

function capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

const appNameSuffix =
    buildInfo.releaseChannel === "stable"
        ? ""
        : capitalizeFirstLetter(buildInfo.releaseChannel);
export const APP_COMPANY = "Discord Inc";
export const APP_DESCRIPTION = "Discord - https://discord.com";
export const APP_NAME = `Discord${appNameSuffix}`;
export const APP_NAME_FOR_HUMANS = `Discord${
    appNameSuffix !== "" ? ` ${appNameSuffix}` : ""
}`;
const APP_ID_BASE = "com.squirrel";
export const APP_ID = `${APP_ID_BASE}.${APP_NAME}.${APP_NAME}`;
export const APP_PROTOCOL = "Discord";
export const API_ENDPOINT =
    settings.get<string | undefined>("API_ENDPOINT") ||
    "https://discord.com/api";
export const UPDATE_ENDPOINT =
    settings.get<string | undefined>("UPDATE_ENDPOINT") || API_ENDPOINT;
export const NEW_UPDATE_ENDPOINT =
    settings.get<string | undefined>("NEW_UPDATE_ENDPOINT") ||
    "https://updates.discord.com/";
export const DISABLE_WINDOWS_64BIT_TRANSITION =
    settings.getWithDefaultValue<boolean>(
        "DISABLE_WINDOWS_64BIT_TRANSITION",
        false,
    );
export const OPTIN_WINDOWS_64BIT_TRANSITION_PROGRESSION =
    settings.getWithDefaultValue<boolean>(
        "OPTIN_WINDOWS_64BIT_TRANSITION_PROGRESSION",
        false,
    );
