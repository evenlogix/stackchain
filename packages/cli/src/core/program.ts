import { Command } from 'commander';
import chalk from 'chalk';

export const CLI_VERSION = '0.1.0';

export function buildProgram(): Command {
  const program = new Command();

  program
    .name('stackchain')
    .description(
      'StackChain — encode proven engineering decisions into automation.\n' +
        'Generate production-ready software foundations without unnecessary complexity.',
    )
    .version(CLI_VERSION);

  return program;
}

export function printBanner(): void {
  console.log(chalk.bold.cyan('StackChain') + chalk.dim('  developer productivity platform'));
}
