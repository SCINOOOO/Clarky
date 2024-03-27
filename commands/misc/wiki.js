import { SlashCommandBuilder } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import fetch from 'node-fetch';
import chalk from 'chalk';

const logE = (message) => console.error(chalk.bold.red("[wiki.JS]"), chalk.red(message));

const wikipediaLogoURLs = {
    en: "https://en.wikipedia.org/static/images/project-logos/enwiki.png",
    de: "https://de.wikipedia.org/static/images/project-logos/dewiki.png",
    fi: "https://fi.wikipedia.org/static/images/project-logos/fiwiki.png"
};

export const command = {
    data: new SlashCommandBuilder()
        .setName('wiki')
        .setDescription('Search something on Wikipedia.')
        .addStringOption(option =>
            option.setName('input')
                .setDescription('Your search input.')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Select a user you want to share the result with.'))
        .addStringOption(option =>
            option.setName('language')
                .setDescription('The language of the Wikipedia to search (Default = English).')
                .setRequired(false)
                .addChoices(
                    { name: 'Deutsch (German)', value: 'de' },
                    { name: 'Suomi (Finnish)', value: 'fi' }
                )),
    async execute(interaction) {
        const query = interaction.options.getString('input');
        const user = interaction.options.getUser('user');
        const language = interaction.options.getString('language') || 'en';
        const url = `https://${language}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.type === 'https://mediawiki.org/wiki/HyperSwitch/errors/not_found') {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('Sorry, I could not find a Wikipedia page for your input.')
                    .setFooter({ text: 'Wiki provided by 🤖 Clarky', iconURL: wikipediaLogoURLs[language] });
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                return;
            }

            let descriptionText = '';
            if (user) {
                descriptionText += `Hey ${user}! ${interaction.user} thought this would be interesting for you!\n\n`;
            }
            descriptionText += '```' + (data.extract.length > 4080 ? `${data.extract.substring(0, 4077)}...` : data.extract) + '```';

            const wikiEmbed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle(`${data.title}`)
                .setURL(data.content_urls.desktop.page)
                .setDescription(descriptionText)
                .setFooter({ text: 'Wiki provided by 🤖 Clarky', iconURL: wikipediaLogoURLs[language] })
                .setTimestamp();

            if (data.thumbnail) wikiEmbed.setImage(data.thumbnail.source);

            await interaction.reply({ embeds: [wikiEmbed] });
        } catch (error) {
            logE(error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('An error occurred while trying to fetch data from Wikipedia.')
                .setFooter({ text: 'Wiki provided by 🤖 Clarky', iconURL: wikipediaLogoURLs[language] });
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};