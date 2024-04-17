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

use caesar_util::paths::{resolve_discord_paths, DiscordFlavor};
use dialoguer::Select;

use crate::tasks::{Task, TaskInfo};

mod tasks;

const FLAVORS: [DiscordFlavor; 4] = [
    DiscordFlavor::Stable,
    DiscordFlavor::Ptb,
    DiscordFlavor::Canary,
    DiscordFlavor::Dev,
];

const TASKS: [Task; 5] = [Task::Build, Task::Copy, Task::Dev, Task::Pack, Task::Run];

fn main() {
    let args: Vec<String> = std::env::args().collect();

    // Move into the root of the repository.
    std::env::set_current_dir("..").unwrap();
    println!(
        "Using working directory: {:?}",
        std::env::current_dir().unwrap()
    );

    let mut flavor_selection = args
        .iter()
        .position(|arg| arg == "--flavor")
        .map(|index| args[index + 1].parse::<usize>().unwrap_or(0))
        .unwrap_or(usize::MAX);

    if flavor_selection >= FLAVORS.len() {
        flavor_selection = Select::new()
            .with_prompt("Select Discord flavor")
            .items(&FLAVORS)
            .interact()
            .unwrap();
    } else {
        println!("Flavor specified via argument");
    }

    let flavor = FLAVORS[flavor_selection];
    println!("Using flavor: {:?}", flavor);

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

    if task_selection >= TASKS.len() {
        task_selection = Select::new()
            .with_prompt("Select task")
            .items(&TASKS)
            .interact()
            .unwrap();
    } else {
        println!("Task specified via argument");
    }

    let task = &TASKS[task_selection];
    println!("Running task: {}", task.name());
    task.run(path);
}
