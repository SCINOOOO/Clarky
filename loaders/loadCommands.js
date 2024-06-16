import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

import wiki from '../commands/misc/wiki.js'
import steamuser from '../commands/misc/steamuser.js'
import sleep from '../commands/developer/sleep.js'
import clear from '../commands/moderation/clear.js'
import embed from '../commands/moderation/embed.js'

const cmds = [wiki, steamuser, sleep, clear, embed];

export function loadCommands(client) {
    client.commands = new Map();
    for (const cmd of cmds) {
        client.commands.set(cmd.command.data.name, cmd.command); 
    }
}
