import { ActivityType } from 'discord.js';
import { startRotation } from '../utils/botPresence.js';

export function execute(member) {
  const welcomeMessage = `Welcome ${member.user.tag}!`;

  member.client.user.setPresence({
    activities: [{ name: welcomeMessage, type: ActivityType.Playing }],
    status: 'online',
  });

  setTimeout(() => startRotation(member.client), 30000);
}