import {PermissionsBitField, SlashCommandBuilder, EmbedBuilder} from "discord.js";
import chalk from 'chalk';
  
const logE = (message) => console.error(chalk.bold.red("[clear.JS]"), chalk.red(message));
  
const footerText = "Chat Clear provided by 🤖 Clarky";
  

const errorEmbed = (description, clientIcon, footerText) =>
  new EmbedBuilder()
    .setTitle("Message clear failed!")
    .setColor("#FF0060")
    .setDescription(description)
    .setFooter({ text: footerText, iconURL: "https://assets.materialup.com/uploads/0156cdd7-841b-493e-aa15-6ff2692273f7/preview" });
  
const successEmbed = (description, clientIcon, footerText) =>
  new EmbedBuilder()
    .setTitle("Message clear successful!")
    .setColor("#00DFA2")
    .setDescription(description)
    .setFooter({ text: footerText, iconURL: "https://assets.materialup.com/uploads/0156cdd7-841b-493e-aa15-6ff2692273f7/preview" });
  
export default {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Clears messages.")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("The amount of messages to delete (1-100)")
        .setRequired(true),
    )
    .addRoleOption((option) =>
      option
        .setName("exclude_role")
        .setDescription("Exclude messages from members with this role")
        .setRequired(false),
    ),
  async execute(interaction) {
    const amount = interaction.options.getInteger("amount");
    const excludeRole = interaction.options.getRole("exclude_role");
    const clientIcon = interaction.client.user.displayAvatarURL(); 
  
    if (amount < 1 || amount > 100) {
      await interaction.reply({
        embeds: [
          errorEmbed(
            "Please specify an amount between 1 and 100.",
            clientIcon,
            footerText,
          ),
        ],
        ephemeral: true,
      });
      return;
    }
  
    if (
      !interaction.channel
        .permissionsFor(interaction.client.user)
        .has(PermissionsBitField.Flags.ManageMessages)
    ) {
      await interaction.reply({
        embeds: [
          errorEmbed(
            "I need permission to manage messages in this channel.",
            clientIcon,
            footerText,
          ),
        ],
        ephemeral: true,
      });
      return;
    }
  
    try {
      const fetchedMessages = await interaction.channel.messages.fetch({
        limit: amount,
      });
      const filteredMessages = excludeRole
        ? fetchedMessages.filter(
            (m) => !m.member.roles.cache.has(excludeRole.id),
          )
        : fetchedMessages;
  
      if (filteredMessages.size === 0) {
        await interaction.reply({
          embeds: [
            errorEmbed(
              "No messages were deleted. This might be due to all messages being older than 14 days or not matching the specified criteria.",
              clientIcon,
              footerText,
            ),
          ],
          ephemeral: true,
        });
        return;
      }
  
      await interaction.channel.bulkDelete(filteredMessages, true);
      const successMessage =
        `**${filteredMessages.size}** messages were deleted successfully.` +
        `${excludeRole ? `\nMessages from members with the ${excludeRole} role were not deleted.` : ""}`;
  
      await interaction.reply({
        embeds: [successEmbed(successMessage, clientIcon, footerText)],
        ephemeral: true,
      });
    } catch (error) {
      logE(`Error encountered during command execution: ${error}`);
      await interaction.reply({
        embeds: [
          errorEmbed(
            "Failed to delete messages. Please ensure I have the proper permissions and the messages are not older than 14 days.",
            clientIcon,
            footerText,
          ),
        ],
        ephemeral: true,
      });
    }
  },
};
