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

import { getSettings } from "../config/app-settings";
import { getBuildInfo } from "./build-info";

const buildInfo = getBuildInfo();
const settings = getSettings();

const productName = "Discord";
const domain = "https://discord.com";

const channel = buildInfo.releaseChannel;
const channelSuffix =
    channel === "stable" ? "" : channel[0].toUpperCase() + channel.slice(1);
const nameWithChannel = productName + channelSuffix;

export const APP_COMPANY = `${productName} Inc`;
export const APP_DESCRIPTION = `${productName} - ${domain}`;
export const APP_NAME = nameWithChannel;
export const APP_NAME_FOR_HUMANS = `${productName} ${channelSuffix}`.trim();
export const APP_ID = `com.squirrel.${nameWithChannel}.${nameWithChannel}`;
export const APP_PROTOCOL = productName;
export const API_ENDPOINT =
    settings.get<string | undefined>("API_ENDPOINT") || `${domain}/api`;
export const NEW_UPDATE_ENDPOINT =
    settings.get<string | undefined>("NEW_UPDATE_ENDPOINT") ||
    "https://updates.discord.com/";
export const UPDATE_ENDPOINT =
    settings.get<string | undefined>("UPDATE_ENDPOINT") || `${domain}/api`;
export const DISABLE_WINDOWS_64BIT_TRANSITION = false;
export const OPTIN_WINDOWS_64BIT_TRANSITION_PROGRESSION = false;
