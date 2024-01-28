# caesar

Caesar is an open-source project reimplementing Discord's desktop bootstrapper and core modules[^1].

## The What

Caesar is a free and open-source, stability- and performance-oriented reimplementation of the Discord desktop bootstrapper application. This is commonly referred to as the `app.asar` file[^2].

Caesar will be distributed both as a packed ASAR archive to be used with an existing Discord installation and also as a standalone application.

## The Why

Discord's official bootstrapper is slow, bloated, and unhackable. Caesar aims to fix this. Alternatives exist, such as [GooseMod](https://github.com/GooseMod/OpenAsar) and my own personal (and now unmaintained) fork [steviegt6/nucleus](https://github.com/steviegt6/nucleus), but they are unsatisfactory.

The two main reasons to create an alternative to OpenAsar instead of forking it and potentially contributing back are 1) OpenAsar reuses large swaths of proprietary code and 2) the project scopes are simply different; OpenAsar aims to reimplement the main bootstrapper while Caesar has its eyes further set on reimplementing modules used by the bootstrapper.

Caesar also intends to provide first-class support for many client modifications, with compatibility as a focus.

## The How

skillz

...and also:

-   [GooseMod/OpenAsar](https://github.com/GooseMod/OpenAsar),
-   [steviegt6/nucleus](https://github.com/steviegt6/nucleus),
-   [OpenAsar/discord-desktop-datamining](https://github.com/OpenAsar/discord-desktop-datamining),
-   and more.

## Installation

### Integrate with an existing Discord installation

Caesar distributes raw `.asar` files to be dropped into an existing Discord installation. This process may be automated by the GTK installer.

### Install as a Standalone Installation

Caesar is also distributed as a standalone Electron application that does not require a preexisting Discord installation. Various installers and portable releases are provided.

## Building

Caesar uses a mixture of TypeScript and Rust for various tools. The GTK installer and build scripts are written in Rust, and Caesar (the bootstrapper) is written in TypeScript.

Rust, Node, and npm are all expected to be installed on your system. I have not tested with any package manager other than npm because I don't care.

Gtk4 and various other libraries should be installed; this is easy on Linux, but annoying on Windows. A `rust-toolchain` file whose contents are just `stable-x86_64-pc-windows-gnu` has been provided, but changing the toolchain manually may be required.

You can build releases with `npm run package:caesar:<your discord flavor>`. Development can be done with `npm run start:caesar:<your discord flavor>`.

## Licensing

Caesar is currently licensed under the GNU Affero General Public License v3.0. I would like to keep it this way, though it may be subject to change.

[^1]: Not all core modules will be reimplemented. Effort is required to reverse-engineer native modules.
[^2]: The most notable example of this is [GooseMod/OpenAsar](https://github.com/GooseMod/OpenAsar).
