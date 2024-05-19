import chalk from "chalk";
import { ChannelType, EmbedBuilder, PermissionsBitField } from "discord.js";

const logE = (message) => console.error(chalk.bold.red("[tempVoiceHandler.JS]"), chalk.red(message));
const logS = (message) => console.log(chalk.bold.green("[tempVoiceHandler.JS]"), chalk.green(message));

const tempChannels = new Map(); 
const channelCounts = new Map(); 

export async function tempVoiceHandler(oldState, newState) {
    const { client } = oldState;
    const creatorIds = process.env.TEMP_CREATORS.split(",").map(id => id.trim());
    const isJoiningCreatorChannel = creatorIds.includes(newState.channelId) && !oldState.channelId;
    const isMovingToCreatorChannel = creatorIds.includes(newState.channelId) && oldState.channelId !== newState.channelId;

    if (isJoiningCreatorChannel || isMovingToCreatorChannel) {
        try {
            const userId = newState.member.id;
            const userName = newState.member.displayName;
            const category = newState.channel.parent;

            const cleanChannelName = newState.channel.name.replace(/🞦\s*/, '').trim();

            const creatorChannelCount = channelCounts.get(newState.channelId) || 0;
            channelCounts.set(newState.channelId, creatorChannelCount + 1);
            const channelNumber = String(creatorChannelCount + 1).padStart(3, '0');
            const channelName = `${cleanChannelName} #${channelNumber}`;

            const tempChannel = await newState.guild.channels.create({
              name: channelName,
              type: ChannelType.GuildVoice,
              parent: category,
              userLimit: newState.channel.userLimit,
              permissionOverwrites: [
                  {
                      id: newState.guild.roles.everyone.id,
                      allow: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.SendMessages]
                  }
              ],
          });
          

            tempChannels.set(tempChannel.id, {
                creator: userId,
                originalChannel: newState.channelId
            });

            await newState.member.voice.setChannel(tempChannel);

            const userMention = `<@${userId}>`;
            const messageContent = `${userMention}!`;

            await sendVoiceChannelMessage(client, tempChannel, messageContent);

            const embed = new EmbedBuilder()
                .setTitle("TEMPORARY VOICE PANEL")
                .setDescription(`Here is your temporary voice channel! \n\nThis channel will be automatically deleted when no one is inside. \n\nThe Owner of the channel can edit it with the buttons below. (coming soon) \n\n**Enjoy your conversation & keep it respectful!**`)
                .setColor("#5865F2")
                .setFooter({ text: "Temporary Voice Panel provided by 🤖 Clarky", iconURL: newState.guild.iconURL() })

            await sendVoiceChannelMessage(client, tempChannel, { embeds: [embed] }); 
        } catch (error) {
            logE(`Failed to create temporary channel: ${error}`);
        }
    }

    if (tempChannels.has(oldState.channelId) && (!newState.channelId || oldState.channelId !== newState.channelId)) {
        const tempChannelInfo = tempChannels.get(oldState.channelId);
        const tempChannel = oldState.guild.channels.cache.get(oldState.channelId);

        if (tempChannel && tempChannel.members.size === 0) {
            try {
                await tempChannel.delete();
                tempChannels.delete(oldState.channelId);

                const originalChannelId = tempChannelInfo.originalChannel;
                const currentCount = channelCounts.get(originalChannelId);
                if (currentCount) {
                    channelCounts.set(originalChannelId, currentCount - 1);
                }
            } catch (error) {
                logE(`Failed to delete temporary channel: ${error}`);
            }
        }
    }
}

async function sendVoiceChannelMessage(client, channel, message) {
    try {
        await channel.send(message);
    } catch (error) {
        logE(`Failed to send message in voice channel chat: ${error}`);
    }
}

