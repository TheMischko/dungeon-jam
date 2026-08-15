# DungeonJam - Local audio Discord streaming app

[![Release](https://img.shields.io/github/v/release/TheMischko/dungeon-jam?include_prereleases&color=blue)](https://github.com/TheMischko/dungeon-jam/releases)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![CI Status](https://github.com/TheMischko/dungeon-jam/actions/workflows/ci.yml/badge.svg)](https://github.com/TheMischko/dungeon-jam/actions)

**Dungeon Jam** is a desktop music player application built with **Electron** and **Angular** (v22) designed for TTRPG Game Masters and music enthusiasts that enables users to:
- Organize and play local music files with full library management
- Stream audio to Discord voice channels via a Discord bot integration
- Capture audio from the application and forward it to connected Discord servers
- Create Scenes, Playlists, and Sound Effect boards for immersive live gaming sessions

---

## Downloads & Alpha Release

You can download the latest pre-built installers for **Windows**, **macOS**, and **Linux** from the [GitHub Releases](https://github.com/TheMischko/dungeon-jam/releases) page.

---

## General Workflow
- **Library:** Drag and drop local audio files onto the Library page, fill in details, and upload.
- **Sound Effects:** Upload sound effect triggers via drag and drop for quick playback during sessions.
- **Playlists:** Organize uploaded tracks into custom playlists.
- **Scenes & Sessions:** Combine playlists with sound effect triggers into Scenes, and organize Scenes into Sessions for effortless access during live DMing.

---

## Connecting to a Discord Server

1. Navigate to the [Discord Developer Portal](https://discord.com/developers/applications) and sign in with your Discord account.
2. Click the **New Application** button in the top right corner.
3. Fill in a default name for your new Discord bot and confirm.
4. Navigate to **OAuth2** settings page under the **Overview** tab on the left side panel.
5. Find the **OAuth2 URL Generator** section and check the **bot** option.
6. Under **Bot permissions**, select **Connect** and **Speak** permissions in the **Voice permissions** column.
7. Scroll down, copy the **Generated URL**, and open it in a new browser tab.
8. Select the Discord server where the bot should be added and authorize it.
9. Head back to the [Discord Developer Portal](https://discord.com/developers/applications).
10. Navigate to **Bot** settings page under the **Overview** tab.
11. Find the **Token** section and click **Reset token**.
12. Copy the generated Bot Token.
13. Open **DungeonJam**, navigate to the **Settings** page.
14. Click **Create token**, enter a label, and paste the token into the **Discord API key** field.
15. Click **Save**, and toggle the connection switch to connect the bot.
16. Once connected, click on the **Destination control** in the left panel (currently showing *Playing locally*) and select the voice channel where the bot should join.
17. You are ready to stream audio directly into Discord!

---

## Feedback & Bug Reporting

Found a bug or have a suggestion?
- Report issues on our [GitHub Issues](https://github.com/TheMischko/dungeon-jam/issues) page.
- Need to share logs? Open **Settings** in DungeonJam and click **Open logs** to attach your most recent `*.log` file.

---

## Development

### Requirements

| Requirement | Version |
|-------------|---------|
| [Node.js](https://nodejs.org/en) | \>= 20  |
| [TypeScript](https://www.typescriptlang.org/) | \>= 5.0 |

### Setup
1. Clone the repository and install root dependencies:
   ```bash
   npm install
   ```
2. Install frontend dependencies:
   ```bash
   cd frontend && npm install && cd ..
   ```
3. Start the Angular frontend development server:
   ```bash
   npm run start:frontend
   ```
4. Start the main Electron application:
   ```bash
   npm run start
   ```

### Command Line Flags & Environment Variables

| Flag / Variable               | Description                                                                                                                                             | Command / Usage                                                      |
|-------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------|
| `--temp-db`<br>`TEMP_DB=true` | Launches the app in **temporary database mode**. Starts with a fresh, empty database (`db_temp.json`) that is automatically erased when the app closes. | `npm run start:temp`<br>*or*<br> `electron build/src/index.js --temp-db` |

---

## License

This project is licensed under the **GNU General Public License v3.0** - see the [LICENSE](LICENSE) file for details.

### Disclaimer
- File [PCMStream.worklet.js](src/sound-capture/PCMStream.worklet.js) comes from the [Kenku FM](https://github.com/owlbear-rodeo/kenku-fm) repository.