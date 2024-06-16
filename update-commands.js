import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.TOKEN;

const logE = (message) => console.error(chalk.bold.red("[update-commands.JS]"), chalk.red(message));
const logS = (message) => console.log(chalk.bold.green("[update-commands.JS]"), chalk.green(message));
const logC = (message) => console.log(chalk.bold.white("[update-commands.JS]"), chalk.white(message));
const log = (message) => console.log(chalk.bold.gray("[update-commands.JS]"), chalk.gray(message));

export async function updateCommands(client) {
    const rest = new REST({ version: '9' }).setToken(token);
    const addGlobalNames = process.env.ADD_GLOBAL_NAMES ? process.env.ADD_GLOBAL_NAMES.split(',') : [];
    const removeGlobalIds = process.env.REMOVE_GLOBAL_IDS ? process.env.REMOVE_GLOBAL_IDS.split(',') : [];

    const existingGlobalCommands = await rest.get(Routes.applicationCommands(clientId));
    const existingGlobalCommandNames = existingGlobalCommands.map(cmd => cmd.name);

    const commands = [...client.commands.values()].map(cmd => cmd.data.toJSON());

    try {
        logC('Started refreshing application (/) commands.');

        const currentCommands = await rest.get(Routes.applicationGuildCommands(clientId, guildId));
        const currentCommandNames = currentCommands.map(cmd => cmd.name);

        for (const command of commands) {
            if (currentCommandNames.includes(command.name)) {
                log(`Refreshed command "${command.name}" in guild ID: ${guildId}.`);
            } else {
                logS(`Added new command "${command.name}" to guild ID: ${guildId}.`);
            }
        }

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        logS('Successfully reloaded application (/) commands.');
    } catch (error) {
        logE(error);
    }

    for (const name of addGlobalNames) {
        const command = client.commands.get(name);
        if (command) {
            try {
                if (existingGlobalCommandNames.includes(name)) {
                    log(`Global command "${name}" already exists and is now refreshed.`);
                } else {
                    await rest.post(
                        Routes.applicationCommands(clientId),
                        { body: command.data.toJSON() },
                    );
                    logS(`Successfully added global command: ${name}`);
                }
            } catch (error) {
                logE(`Failed to add global command ${name}: ${error}`);
            }
        } else {
            logE(`Command ${name} not found.`);
        }
    }

    for (const commandId of removeGlobalIds) {
        try {
            await rest.delete(
                Routes.applicationCommand(clientId, commandId),
            );
            logS(`Successfully removed global command ID: ${commandId}`);
        } catch (error) {
            logE(`Failed to remove global command ID ${commandId}: ${error}`);
        }
    }
    
};
