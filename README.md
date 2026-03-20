# DungeonJam - Local audio Discord streaming app
**Dungeon Jam** is a desktop music player application built with **Electron** and **Angular** (v19) that enables users to:
- Organize and play local music files with full library management
- Stream audio to Discord voice channels via a Discord bot integration
- Capture audio from the application and forward it to connected Discord servers
- Navigate through a tabbed interface supporting future extensibility (e.g., YouTube tabs)

### Setup
1. Make sure NodeJS is installed on your system.
2. Perform `npm i` to install dependencies.
3. Create `.env` file in the root of the project and populate it with the DISCORD BOT API token
```dotenv
DISCORD_TOKEN="..."
```
4. Make sure your Discord bot is part of exactly one Discord server, which has at least one joinable voice channel.
5. Start the frontend development server by `npm run start:frontend`
6. Once the Angular frontend is running, run the main app by `npm run start`
7. Once loaded, check if your Discord bot has logged in and joined the first available voice channel on the server.
8. Play anything on the left tab. (You should be able to hear that in Discord)


Disclaimer:
- File [PCMStream.worklet.js](src/sound-capture/PCMStream.worklet.js) comes from [https://github.com/owlbear-rodeo/kenku-fm](https://github.com/owlbear-rodeo/kenku-fm) repo.