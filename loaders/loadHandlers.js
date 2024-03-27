import { commandHandler } from '../handlers/commandHandler.js';
import { buttonHandler } from '../handlers/buttonHandler.js';
import { modalHandler } from '../handlers/modalHandler.js';
import { execute as guildMemberAddExecute } from '../handlers/guildMemberAddHandler.js';


export function loadHandlers(client) {
    client.on('interactionCreate', async interaction => {
        if (interaction.isCommand()) await commandHandler(interaction);
        else if (interaction.isButton()) await buttonHandler(interaction);
        else if (interaction.isModalSubmit()) await modalHandler(interaction);
    });

    client.on('guildMemberAdd', guildMemberAddExecute);
}