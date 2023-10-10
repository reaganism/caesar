use std::path::PathBuf;

// Paths and resolution logic based on:
// https://github.com/replugged-org/replugged/blob/main/scripts/inject/platforms

#[derive(Clone, Copy, Debug)]
pub enum DiscordFlavor {
    Stable,
    Ptb,
    Canary,
    Dev,
}

pub trait DiscordPathResolver {
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
        let target_app_dir = discord_dir.read_dir();
        if target_app_dir.is_err() {
            return vec![];
        }
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

        let asar_path = target_app_dir.join("resources").join("app.asar");

        vec![DiscordPath {
            flavor: self.clone(),
            directory_path: target_app_dir,
            asar_path,
        }]
    }

    #[cfg(target_os = "linux")]
    fn resolve_discord_paths(&self) -> Vec<DiscordPath> {
        todo!()
    }

    #[cfg(target_os = "macos")]
    fn resolve_discord_paths(&self) -> Vec<DiscordPath> {
        todo!()
    }
}

pub struct DiscordPath {
    pub flavor: DiscordFlavor,
    pub directory_path: PathBuf,
    pub asar_path: PathBuf,
}

pub fn resolve_discord_paths(flavor: DiscordFlavor) -> Vec<DiscordPath> {
    flavor.resolve_discord_paths()
}
