import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import chalk from "chalk";

const logE = (message) => console.error(chalk.bold.red("[embed.JS]"), chalk.red(message));

const errorEmbed = (description) =>
  new EmbedBuilder()
    .setTitle("Error!")
    .setColor("#FF0060")
    .setDescription(description)
    .setFooter({ text: footerText, iconURL: footerIconURL });

export const command = {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Copy the text and formatting of the given message ID, delete the message and resend it as an embed.')
        .addStringOption(option => 
            option.setName('message_id')
                .setDescription('The ID of the message to embed')
                .setRequired(true)),
    async execute(interaction) {
        const messageId = interaction.options.getString('message_id');
        const channel = interaction.channel;

        try {
            const message = await channel.messages.fetch(messageId);

            if (!message) {
                await interaction.reply({ content: 'Message not found!', ephemeral: true });
                return;
            }

            const embed = new EmbedBuilder()
                .setColor("#5865F2")
                .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL() })
                .setDescription(message.content)
                .setFooter({ text: "Server informations provided by 🤖 Clarky", iconURL: message.guild.iconURL() })
                .setTimestamp();

            await message.delete();

            await channel.send({ embeds: [embed] });

        } catch (error) {
            logE(`[embed.js] Error embedding message: ${error}`);
            await interaction.reply({ embeds: [errorEmbed('There was an error trying to embed the message.')], ephemeral: true });
        }
    },
};
