use std::{fmt::Display, fs::copy, process::Command};

use caesar_util::paths::DiscordPath;

pub enum Task {
    Build,
    Copy,
    Dev,
    Pack,
    Run,
}

pub trait TaskInfo {
    fn name(&self) -> String;
    fn run(&self, path: &DiscordPath);
}

impl Display for Task {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.name())
    }
}

impl TaskInfo for Task {
    fn name(&self) -> String {
        match self {
            Task::Build => "Build".into(),
            Task::Copy => "Copy".into(),
            Task::Dev => "Dev".into(),
            Task::Pack => "Pack".into(),
            Task::Run => "Run".into(),
        }
    }

    fn run(&self, path: &DiscordPath) {
        match self {
            Task::Build => run_build(path),
            Task::Copy => run_copy(path),
            Task::Dev => run_dev(path),
            Task::Pack => run_pack(path),
            Task::Run => run_run(path),
        }
    }
}

fn run_build(_path: &DiscordPath) {
    println!("Building with tsc...");
    let status = npx()
        .arg("tsc")
        .arg("-p")
        .arg("./discord/tsconfig.json")
        .status()
        .unwrap();

    if !status.success() {
        panic!("Failed to build with tsc");
    }
}

fn run_copy(path: &DiscordPath) {
    println!("Copying packed .asar file to Discord app.asar location...");
    println!(
        "Using Discord app.asar location: {}",
        path.asar_path.display()
    );
    copy("./dist/app.asar", path.asar_path.clone()).unwrap();
}

fn run_dev(path: &DiscordPath) {
    run_build(path);
    run_pack(path);
    run_copy(path);
    run_run(path);
}

fn run_pack(_path: &DiscordPath) {
    println!("Packing files into ASAR...");

    println!("Copying over files to destination directory for packing...");
    copy("./discord/package.json", "./dist/discord/package.json").unwrap();

    println!("Packing into .asar: app.asar");
    let status = npx()
        .arg("asar")
        .arg("pack")
        .arg("./dist/discord")
        .arg("./dist/app.asar")
        .status()
        .unwrap();

    if !status.success() {
        panic!("Failed to pack into .asar");
    }
}

#[cfg(target_os = "windows")]
fn run_run(path: &DiscordPath) {
    let files = std::fs::read_dir(path.directory_path.clone()).unwrap();
    let exe = files
        .filter_map(|entry| {
            let entry = entry.unwrap();
            let path = entry.path();
            if path.is_file() {
                let file_name = path.file_name().unwrap().to_str().unwrap();
                if file_name.ends_with(".exe") {
                    return Some(path);
                }
            }
            None
        })
        .next()
        .unwrap();

    println!("Running Discord...");
    let status = Command::new(exe).status().unwrap();

    if !status.success() {
        panic!("Failed to run Discord");
    }
}

fn npx() -> Command {
    #[cfg(target_os = "windows")]
    return Command::new("npx.cmd");
    #[cfg(not(target_os = "windows"))]
    return Command::new("npx");
}
