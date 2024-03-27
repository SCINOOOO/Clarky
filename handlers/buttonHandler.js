import chalk from "chalk";

const logE = (message) => console.error(chalk.bold.red("[buttonHandler.JS]"), chalk.red(message));
const logW = (message) => console.warn(chalk.bold.yellow("[buttonHandler.JS]"), chalk.yellow(message));
const log = (message) => console.log(chalk.bold.gray("[buttonHandler.JS]"), chalk.gray(message));
const logS = (message) => console.log(chalk.bold.green("[buttonHandler.JS]"), chalk.green(message));

export async function buttonHandler(interaction) {
  if (!interaction.isButton()) return;

  log(`Button ${interaction.customId} was clicked.`);
}