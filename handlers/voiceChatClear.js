import chalk from "chalk";

const logE = (message) => console.error(chalk.bold.red("[voiceChatClear.JS]"), chalk.red(message));
const logS = (message) => console.log(chalk.bold.green("[voiceChatClear.JS]"), chalk.green(message));

export async function voiceChatClear(oldState, newState) {
  const voiceChannel = oldState.channel || newState.channel;
  if (!voiceChannel) return;

  if (oldState.channel && oldState.channel.members.size === 0) {
    try {
      const textChannel = voiceChannel.guild.channels.cache.find(
        (channel) => channel.parentId === voiceChannel.id || channel.id === voiceChannel.id
      );
      
      if (!textChannel) {
        logE(`No associated text channel found for voice channel ${voiceChannel.name}.`);
        return;
      }

      let fetched;
      do {
        fetched = await textChannel.messages.fetch({ limit: 100 });
        await Promise.all(fetched.map((message) => message.delete()));
      } while (fetched.size >= 2);

      logS(`Cleared all messages in ${voiceChannel.name} as it became empty.`);
    } catch (error) {
      logE(`Failed to clear messages in ${voiceChannel.name}: ${error}`);
    }
  }
}
