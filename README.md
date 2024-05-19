
### 🤖 Clarky Discord Bot 

> Its my first Discord Bot ever coded, so maybe not everything is working 100%.

🌟 Current Features

> Rotating botPresence (Changing the Bots activity every 30 seconds). Welcome new users in the Bot Presence.

> Delete all chat messages of a voice channel when it gets empty. ** NEW **

> Temporary Voice Channel System ** NEW ** 


⚙️ Commands

> /clear [AMOUNT 1-100] [EXCLUDE ROLE] (Clears the chat based on a given amount of messages from 1-100 while giving the user the option to exclude messages sent by the selected role.)

> /steamuser [ID, URL, NAME] (Sends an embed message with useful informations about any steamuser.)

> /sleep (Stops the Bot. Only available for the User set as "DEV_CLIENT_ID" in the .env file.)

> /wiki [INPUT] [SELECT USER TO MENTION] [DE/FI] (Sends an embed message with a short Wikipedia text + URL. (German and Finish can be used aswell, default is english.))

> /embed [MESSAGE_ID] (Resends the selected message in the current channel, but as embed.) ** NEW **


📝 .env File Preset

```
# GENERAL NEEDED
TOKEN=
STEAM_APIKEY=

# NEEDED FOR "update-commands.js"
CLIENT_ID=
GUILD_ID=

# OPTIONAL FOR "update-commands.js"
# Multiple Names ("wiki, sleep, clear, ..")
# Multiple IDs ("8284738787538258351, 8284738787538258351, 8284738787538258351, ..")
ADD_GLOBAL_NAMES=
REMOVE_GLOBAL_IDS=

# UPDATE COMMANDS ON BOT START (TRUE/FALSE)
UPDATE_COMMANDS_ON_START=FALSE

# OPTIONAL FOR "/commands/developer/.." COMMANDS
DEVELOPER_USER_ID=

# TEMPVOICE CREATOR CHANNEL IDS
# Multiple IDs ("8284738787538258351, 8284738787538258351, 8284738787538258351, ..")
# !!! EVERY VOICE CHANNEL EXCEPT FOR THE IDS HERE WILL GET DELETED ON START !!!
TEMP_CREATORS=
```

### Used Resources

> [NodeJS](https://nodejs.org/en) 

> [NPM Discord.js](https://www.npmjs.com/package/discord.js?activeTab=readme) `npm i discord.js`

> [NPM Discord.js/REST](https://www.npmjs.com/package/@discordjs/rest) `npm i @discordjs/rest`

> [NPM DOTENV](https://www.npmjs.com/package/dotenv) `npm i dotenv`

> [NPM DISCORD-API-TYPES](https://www.npmjs.com/package/discord-api-types) `npm i discord-api-types`

> [NPM URL](https://www.npmjs.com/package/url) `npm i url`

> [NPM PATH](https://www.npmjs.com/package/path) `npm i path`

> [NPM FS](https://www.npmjs.com/package/fs) `npm i fs`

> [NPM CHALK](https://www.npmjs.com/package/chalk) `npm i chalk`

> [NPM AXIOS](https://www.npmjs.com/package/axios) `npm i axios`

> [NPM NODE-FETCH](https://www.npmjs.com/package/node-fetch) `npm i node-fetch`

### JOIN MY DISCORD IF YOU NEED HELP OR IF YOU WANT TO COLLABORATE.

> [DISCORD](https://www.discord.gg/6TUKHPSgAW)


Made with 💖 by `SCINOOOO ツ`