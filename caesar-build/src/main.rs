use caesar_util::paths::{resolve_discord_paths, DiscordFlavor};
use dialoguer::Select;

use crate::tasks::{Task, TaskInfo};

mod tasks;

fn main() {
    std::env::set_current_dir("..").unwrap();
    println!(
        "Using working directory: {:?}",
        std::env::current_dir().unwrap()
    );

    let flavors = vec![
        DiscordFlavor::Stable,
        DiscordFlavor::Ptb,
        DiscordFlavor::Canary,
        DiscordFlavor::Dev,
    ];

    let tasks = vec![Task::Build, Task::Copy, Task::Dev, Task::Pack, Task::Run];

    let args: Vec<String> = std::env::args().collect();

    let mut flavor_selection = args
        .iter()
        .position(|arg| arg == "--flavor")
        .map(|index| args[index + 1].parse::<usize>().unwrap_or(0))
        .unwrap_or(usize::MAX);

    if flavor_selection >= flavors.len() {
        flavor_selection = Select::new()
            .with_prompt("Select Discord flavor")
            .items(&flavors)
            .interact()
            .unwrap();
    }

    let flavor = flavors[flavor_selection];
    let paths = resolve_discord_paths(flavor);

    let path = match paths.len() {
        0 => {
            println!("No Discord installation found, exiting.");
            std::process::exit(1);
        }
        1 => &paths[0],
        _ => {
            let path_selection = Select::new()
                .with_prompt("Found multiple Discord installations")
                .items(&paths)
                .interact()
                .unwrap();

            &paths[path_selection]
        }
    };

    let mut task_selection = args
        .iter()
        .position(|arg| arg == "--task")
        .map(|index| args[index + 1].parse::<usize>().unwrap_or(0))
        .unwrap_or(usize::MAX);

    if task_selection >= tasks.len() {
        task_selection = Select::new()
            .with_prompt("Select task")
            .items(&tasks)
            .interact()
            .unwrap();
    }

    let task = &tasks[task_selection];

    println!("Running task: {}", task.name());
    task.run(path);

    /*let flavor = DiscordFlavor::Canary;
    println!("Flavor: {:?}", flavor);
    println!("Searching for Discord installation...");

    let paths = resolve_discord_paths(flavor);
    match paths.len() {
        0 => {
            println!("No Discord installation found, exiting.");
            std::process::exit(1);
        }
        1 => println!(
            "Found Discord installation at {:?}",
            paths[0].directory_path
        ),
        _ => println!(
            "Found multiple Discord installations, using first one: {:?}",
            paths
        ),
    }

    let path = &paths[0].asar_path;
    println!("Path to app.asar: {:?}", path);

    println!()*/
}

/*fn run_npx_command(args: &[&str]) -> Result<(), Box<dyn std::error::Error>> {
    let mut command = std::process::Command::new("npx");
    command.args(args);
    let status = command.status()?;
    if !status.success() {
        return Err("npx command failed".into());
    }
    Ok(())
}*/
