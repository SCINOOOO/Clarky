import { ActivityType } from 'discord.js';
import chalk from "chalk";
const logE = (message) => console.error(chalk.bold.red("[botPresence.JS]"), chalk.red(message));

const rotationPeriod = 30000; 
let rotationInterval; 
let currentPresence = 0; 

const presences = [
  { activities: [{ name: 'Clarky V2.0.0', type: ActivityType.Playing }], status: 'idle' },
  { activities: [{ name: 'Made by SCINOOOO ツ', type: ActivityType.Custom }], status: 'idle' },
];

export function updatePresence(client) {
  if (client.user) {
    try {
      client.user.setPresence(presences[currentPresence]);
      currentPresence = (currentPresence + 1) % presences.length;
    } catch (error) {
      logE(`Failed to set presence: ${error.message}`); 
    }
  }
}

export function startRotation(client) {
  if (rotationInterval) clearInterval(rotationInterval);
  updatePresence(client);
  rotationInterval = setInterval(() => updatePresence(client), rotationPeriod); 
}