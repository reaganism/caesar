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
 *
 * Contents of this file are taken from Replugged, which is licensed under the
 * MIT License. The original source code can be found at:
 * <https://github.com/replugged-org/replugged/blob/main/scripts/inject/platforms>
 * The Replugged repositroy can be found at:
 * <https://github.com/replugged-org/replugged>
 * And the original license can be found at:
 * <https://github.com/replugged-org/replugged/blob/main/LICENSE>
 */

use std::{fmt::Display, path::PathBuf};

/// The "flavor" (or release) of Discord.
#[derive(Clone, Copy, Debug)]
pub enum DiscordFlavor {
    /// Stable, the main release of Discord.
    Stable,

    /// "Public Test Build", more stable than Canary but less stable than Stable.
    Ptb,

    /// Used for alpha testing, not as stable as PTB.
    Canary,

    /// Used for development, staging.
    Dev,
}

/// Handles locating Discord installations.
pub trait DiscordPathResolver {
    /// Resolves the paths to Discord installations.
    ///
    /// # Returns
    ///
    /// A list of Discord paths.
    fn resolve_discord_paths(&self) -> Vec<DiscordPath>;
}

impl DiscordPathResolver for DiscordFlavor {
    #[cfg(target_os = "windows")]
    fn resolve_discord_paths(&self) -> Vec<DiscordPath> {
        let folder = match self {
            DiscordFlavor::Stable => "Discord",
            DiscordFlavor::Ptb => "DiscordPTB",
            DiscordFlavor::Canary => "DiscordCanary",
            DiscordFlavor::Dev => "DiscordDevelopment",
        };
        let local_app_data = std::env::var("LOCALAPPDATA").unwrap();
        let discord_dir = PathBuf::from(local_app_data).join(folder);

        // TODO: Maybe return all of these potential paths?
        // ^ Would make old version filtering the burden of the API consumer.

        let target_app_dir = discord_dir.read_dir();
        if target_app_dir.is_err() {
            return vec![];
        }

        // Filter for directories that start with "app-", but reverse the order
        // to get the latest version.
        let target_app_dir = target_app_dir
            .unwrap()
            .map(|entry| entry.unwrap().path())
            .filter(|path| path.is_dir())
            .collect::<Vec<_>>()
            .into_iter()
            .rev()
            .find(|path| {
                path.file_name()
                    .unwrap()
                    .to_str()
                    .unwrap()
                    .starts_with("app-")
            })
            .unwrap();

        // This path is known to be constant.
        let asar_path = target_app_dir.join("resources").join("app.asar");

        // See earlier TODO regarding returning all paths.
        vec![DiscordPath {
            flavor: self.clone(),
            directory_path: target_app_dir,
            asar_path,
        }]
    }

    // TODO: Linux support.
    // TODO: Mac support.
    // I can implement both of these, but I don't have machines to test on and
    // I can't be asked.

    #[cfg(target_os = "linux")]
    fn resolve_discord_paths(&self) -> Vec<DiscordPath> {
        todo!()
    }

    #[cfg(target_os = "macos")]
    fn resolve_discord_paths(&self) -> Vec<DiscordPath> {
        todo!()
    }
}

impl Display for DiscordFlavor {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        // TODO: Are there official ways Discord presents these versions? I
        // ultimately don't care too much, but it may help with consistency.
        match self {
            DiscordFlavor::Stable => write!(f, "Discord Stable"),
            DiscordFlavor::Ptb => write!(f, "Discord PTB"),
            DiscordFlavor::Canary => write!(f, "Discord Canary"),
            DiscordFlavor::Dev => write!(f, "Discord Dev"),
        }
    }
}

/// A Discord installation path.
#[derive(Clone, Debug)]
pub struct DiscordPath {
    /// The flavor of Discord.
    pub flavor: DiscordFlavor,

    /// The directory path of the Discord installation.
    pub directory_path: PathBuf,

    /// The path to the `app.asar` file.
    pub asar_path: PathBuf,
}

impl Display for DiscordPath {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{} ({})", self.flavor, self.directory_path.display())
    }
}

/// Resolves the paths to Discord installations.
///
/// # Arguments
///
/// * `flavor` - The flavor of Discord to resolve paths for.
///
/// # Returns
///
/// A list of Discord paths.
pub fn resolve_discord_paths(flavor: DiscordFlavor) -> Vec<DiscordPath> {
    flavor.resolve_discord_paths()
}
