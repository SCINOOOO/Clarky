import { Client, GatewayIntentBits, ChannelType } from "discord.js";
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import chalk from "chalk";
import dotenv from "dotenv";
import { loadCommands } from "./loaders/loadCommands.js";
import { loadHandlers } from "./loaders/loadHandlers.js";
import { startRotation } from "./utils/botPresence.js";
import { tempVoiceHandler } from './handlers/tempVoiceHandler.js';

dotenv.config();

const logE = (message) => console.error(chalk.bold.red("[bot.JS]"), chalk.red(message));
const logS = (message) => console.log(chalk.bold.green("[bot.JS]"), chalk.green(message));
const logC = (message) => console.log(chalk.bold.white("[bot.JS]"), chalk.white(message));
const log = (message) => console.log(chalk.bold.gray("[bot.JS]"), chalk.gray(message));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
  ]
});

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

client.once("ready", async () => {
  logC(`==================== [ START ] ====================`);
  startRotation(client); 
  await loadCommands(client); 
  loadHandlers(client);

  if (process.env.UPDATE_COMMANDS_ON_START === 'TRUE') {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const updateCommandsPath = path.join(__dirname, 'update-commands.js');
    const updateCommandsURL = pathToFileURL(updateCommandsPath).href; 
    try {
      logC("Updating commands on start...");
      await delay(1000);
      await import(updateCommandsURL);
      await delay(1000);
      logS("Successfully updated commands on start.");
    } catch (error) {
      logE(`Failed to update commands on start: ${error}`);
    }
  }
  
  await delay(1000);
  logS(`${client.user.tag} is logged in on ${client.guilds.cache.size} guild(s):`);
  await delay(1000);
  
  client.guilds.cache.forEach(guild => {
    log(`"${guild.name}" (ID: ${guild.id})`);
  });
  
  try {
    const guild = client.guilds.cache.first();
    await guild.channels.fetch();
  
    const allVoiceChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildVoice);
  
    const creatorChannelIds = process.env.TEMP_CREATORS.split(",").map(id => id.trim());
  
    allVoiceChannels.forEach(async channel => {
      if (creatorChannelIds.includes(channel.id)) {
      } else {
        try {
          await channel.delete();
          logS(`Deleted temporary voice channel: ${channel.name}`);
        } catch (error) {
          logE(`Failed to delete temporary voice channel: ${channel.name}`);
        }
      }
    });
  
    logC(`==================== [ READY ] ====================`);
  } catch (error) {
    logE(`Failed to fetch guild channels: ${error}`);
  }
  
});

client.on('voiceStateUpdate', async (oldState, newState) => {
  await tempVoiceHandler(oldState, newState);
});

if (!process.env.TOKEN) {
  logE("TOKEN is not defined in your environment.");
  process.exit(1);
}

client.login(process.env.TOKEN).catch(error => {
  logE(`Failed to log in: ${error}`);
  process.exit(1);
});
