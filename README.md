# Lua Games Card Bridge

Millennium plugin that locally bridges Lua games into Steam's native badge and visual Trading Cards UI paths.

The goal is to make Lua game card pages feel consistent with normal Steam games while staying local and visual-only.

## Features

- Reads local Lua game entries from `Steam/config/stplug-in/*.lua`.
- Checks public Steam Store metadata for the "Steam Trading Cards" category.
- Captures SteamUI webpack modules and patches local badge/card data loading.
- Adds the native Library cards section when SteamUI skipped it for a local Lua game.
- Applies local visual card progress in the Library card section: one visual card every 30 minutes of SteamUI playtime.
- Adds a Millennium configuration option for the visual drop cap: Steam-like half set, or the full set.
- Adds local visual badge crafting on Steam Community gamecards pages.
- Shows local badge progress on the Steam Community badges page.

## Screenshots

### Steam Community Gamecards

![Steam Community gamecards page](docs/images/gamecards-page-example.png)

### Steam Community Badges

![Steam Community badges list](docs/images/badges-list-example.png)

### Steam Library Cards Section

![Steam Library cards section](docs/images/library-cards-example.png)

## What This Does Not Do

- It does not edit Steam entitlements.
- It does not create inventory items or force real card drops.
- It does not craft real badges or grant real XP.
- It does not fake earned-card activity.
- It does not modify installed Lua game plugins or other installed plugins.

Card drops are decided by Steam's backend. This bridge only changes the local SteamUI side: discovery, badge data loading, native card-section visibility, and visual-only card ownership inside the Library cards section for Lua games that already have official Steam Trading Cards.

## Privacy and Safety Notes

- The plugin does not include account IDs, profile URLs, local user paths, API keys, tokens, or credentials.
- Runtime cache files are written under Steam's local config folder and are ignored by Git.
- Public backend responses avoid returning local filesystem paths.
- Image URLs accepted from cached Steam badge data are limited to Steam-owned domains.
