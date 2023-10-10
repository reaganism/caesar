# caesar

Open-source project reimplementing Discord's desktop bootstrapper and core modules.

## The What

caesar is a free and open-source, stability- and performance-oriented reimplementation of the Discord desktop bootstrapper application. This is commonly referred to as the `app.asar` file[^1], as it is distributed as a packed ASAR.

## The Why

Discord's official bootstrapper is slow, bloated, and unhackable. caesar aims to fix this. Alternatives exist, such as [GooseMod](https://github.com/GooseMod/OpenAsar) and my own personal (and now unmaintained) fork [steviegt6/nucleus](https://github.com/steviegt6/nucleus).

The two main reasons to create an alternative to OpenAsar instead of forking it and potentially contributing back are 1) OpenAsar reuses large swaths of proprietary code and 2) the project scopes are simply different; OpenAsar aims to reimplement the main bootstrapper while caesar has its eyes further set on reimplementing modules used by the bootstrapper.

## The How

skillz

...and also:

- [GooseMod](https://github.com/GooseMod/OpenAsar),
- [steviegt6/nucleus](https://github.com/steviegt6/nucleus),
- [OpenAsar/discord-desktop-datamining](https://github.com/OpenAsar/discord-desktop-datamining),
- and more.

## Installation

TODO, there is a GTK installer in the works for easy end-user installations. Documentation for building from source is also TODO.

## Licensing

As much as I would have loved to license this under GNU-something-or-other, I can't do that (at least not in good faith). While the code written is my own, there is plenty of *inspiration* taken elsewhere, even from the proprietary bootstrapper, ergo licensing under MIT is easiest.

[^1]: The most notable example of this is [GooseMod/OpenAsar](https://github.com/GooseMod/OpenAsar).
