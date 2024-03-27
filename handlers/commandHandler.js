import chalk from "chalk";

const logE = (message) => console.error(chalk.bold.red("[commandHandler.JS]"), chalk.red(message));
const logW = (message) => console.warn(chalk.bold.yellow("[commandHandler.JS]"), chalk.yellow(message));

export async function commandHandler(interaction) {
  if (!interaction.isCommand()) return;

  const { client } = interaction;
  const command = client.commands.get(interaction.commandName);

  if (!command) {
      logW(`No command matching ${interaction.commandName} was found.`);
      return;
  }

  try {
      await command.execute(interaction);
  } catch (error) {
      logE(error);
      await interaction.reply({ content: 'There was an error executing the command.', ephemeral: true });
  }
}