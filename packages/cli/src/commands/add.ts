import type { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import type { ComponentKind } from '@evenlogix/stackchain-shared';
import { ComponentGenerator } from '../generators/component.js';
import { findProjectRoot, loadStackChainConfig } from '../config/load-config.js';

const KINDS: ComponentKind[] = [
  'feature',
  'screen',
  'widget',
  'model',
  'repository',
  'datasource',
  'usecase',
  'service',
];

export function registerAddCommand(program: Command): void {
  const add = program
    .command('add')
    .description('Add a feature or component to the current project');

  for (const kind of KINDS) {
    add
      .command(`${kind} <name>`)
      .description(`Generate a ${kind}`)
      .option('--feature <feature>', 'Target feature (default: authentication)')
      .action(async (name: string, options) => {
        try {
          const projectRoot = await findProjectRoot(process.cwd());
          if (!projectRoot) {
            throw new Error('Not inside a StackChain project (stackchain.config.ts not found).');
          }

          const config = await loadStackChainConfig(projectRoot);
          if (config.framework !== 'flutter') {
            throw new Error(`add ${kind} currently supports Flutter projects only.`);
          }

          const spinner = ora(`Generating ${kind} "${name}"…`).start();
          const generator = new ComponentGenerator();
          const result = await generator.add(
            { kind, name, feature: options.feature as string | undefined },
            config,
            projectRoot,
          );
          spinner.succeed(`Created ${result.written.join(', ')}`);
        } catch (error) {
          console.error(chalk.red((error as Error).message));
          process.exitCode = 1;
        }
      });
  }
}
