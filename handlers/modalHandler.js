import chalk from "chalk";

const logE = (message) => console.error(chalk.bold.red("[modalHandler.JS]"), chalk.red(message));
const logW = (message) => console.warn(chalk.bold.yellow("[modalHandler.JS]"), chalk.yellow(message));
const log = (message) => console.log(chalk.bold.gray("[modalHandler.JS]"), chalk.gray(message));
const logS = (message) => console.log(chalk.bold.green("[modalHandler.JS]"), chalk.green(message));

export async function modalHandler(interaction) {
  if (!interaction.isModalSubmit()) return;

  log(`Modal submitted with ID ${interaction.customId}.`);
}