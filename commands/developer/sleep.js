import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { getRecentActivity } from "../../utils/recordActivity.js";
import chalk from "chalk";
import dotenv from "dotenv";
dotenv.config();

const logE = (message) => console.error(chalk.bold.red("[sleep.JS]"), chalk.red(message));
const logC = (message) => console.log(chalk.bold.white("[sleep.JS]"), chalk.white(message));
const log = (message) => console.log(chalk.bold.gray("[sleep.JS]"), chalk.gray(message));

const footerText = "Bot Sleep provided by 🤖 Clarky";
const footerIconURL = "https://cdn4.iconfinder.com/data/icons/content-colored/512/Block-512.png";

const errorEmbed = (description) =>
  new EmbedBuilder()
    .setTitle("Error!")
    .setColor("#FF0060")
    .setDescription(description)
    .setFooter({ text: footerText, iconURL: footerIconURL });

const successEmbed = (description) =>
  new EmbedBuilder()
    .setTitle("Bot Sleep Successful!")
    .setColor("#00DFA2")
    .setDescription(description)
    .setFooter({ text: footerText, iconURL: footerIconURL });

export default {
  data: new SlashCommandBuilder()
    .setName("sleep")
    .setDescription("Let the Bot sleep. (Developer only!)"),
  async execute(interaction) {
    const authorizedUserId = process.env.DEVELOPER_USER_ID;
    const client = interaction.client;

    if (interaction.user.id !== authorizedUserId) {
      await interaction.reply({
        embeds: [errorEmbed("You do not have permission to let the bot sleep.")],
        ephemeral: true,
      });
      return;
    }

    const recentActivity = getRecentActivity();
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;

    const shutdownNotices = Object.entries(recentActivity).map(async ([channelId, lastActivity]) => {
      if (lastActivity > tenMinutesAgo) {
        try {
          const channel = await client.channels.fetch(channelId);
          if (channel && channel.isText()) {
            await channel.send({
              embeds: [successEmbed("The bot is going to sleep now...")],
            });
          }
        } catch (error) {
          logE(`Failed to send Stop Message: ${error}`);
        }
      }
    });

    try {
      await Promise.all(shutdownNotices);

      await interaction.reply({
        embeds: [successEmbed("The bot is going to sleep now...")],
        ephemeral: false,
      });

      log(`Bot sleeping by command. Logging out.`);
      logC(`==================== [ SLEEP ] ====================`);

      setTimeout(() => {
        client.destroy();
        process.exit(0);
      }, 5000);
    } catch (error) {
      logE(`Error during shutdown process: ${error}`);
    }
  },
};
