import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadCommandsRecursive(directory, client) {
    const files = fs.readdirSync(directory, { withFileTypes: true });

    for (const file of files) {
        const filePath = path.join(directory, file.name);
        if (file.isDirectory()) {
            await loadCommandsRecursive(filePath, client);
        } else if (file.name.endsWith('.js')) {
            const fileURL = pathToFileURL(filePath).href;
            const command = await import(fileURL);
            client.commands.set(command.command.data.name, command.command); 
        }
    }
}

export async function loadCommands(client) {
    client.commands = new Map();
    const commandsPath = path.join(__dirname, '..', 'commands'); 
    await loadCommandsRecursive(commandsPath, client);
}