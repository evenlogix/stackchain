import type { Command } from 'commander';
import chalk from 'chalk';
import { OFFICIAL_PLUGINS, PluginRegistry } from '@evenlogix/stackchain-registry';

export function registerPluginCommand(program: Command): void {
  const plugin = program.command('plugin').description('Manage StackChain plugins');

  plugin
    .command('list')
    .description('List installed plugins')
    .action(async () => {
      const registry = new PluginRegistry();
      const installed = await registry.list();
      if (installed.length === 0) {
        console.log(chalk.dim('No plugins installed.'));
        console.log(chalk.dim('Official ecosystem:'));
        for (const [name, meta] of Object.entries(OFFICIAL_PLUGINS)) {
          console.log(`  ${chalk.cyan(name)} → ${meta.packageName}`);
        }
        return;
      }
      for (const item of installed) {
        console.log(`${chalk.cyan(item.name)}@${item.version} (${item.packageName})`);
      }
    });

  plugin
    .command('install <name>')
    .description('Install a community or official plugin')
    .action(async (name: string) => {
      const registry = new PluginRegistry();
      const installed = await registry.install(name);
      console.log(chalk.green(`Installed plugin ${installed.name} → ${installed.packageName}`));
      if (installed.official) {
        console.log(
          chalk.dim('Official StackChain plugin recorded in ~/.stackchain/registry.json'),
        );
      } else {
        console.log(
          chalk.dim(
            `Community plugins use package name stackchain-plugin-${name} (or a scoped package).`,
          ),
        );
      }
    });

  plugin
    .command('uninstall <name>')
    .description('Uninstall a plugin')
    .action(async (name: string) => {
      const registry = new PluginRegistry();
      const ok = await registry.uninstall(name);
      if (!ok) {
        console.error(chalk.red(`Plugin not found: ${name}`));
        process.exitCode = 1;
        return;
      }
      console.log(chalk.green(`Uninstalled ${name}`));
    });

  plugin
    .command('official')
    .description('Show official StackChain ecosystem plugins')
    .action(() => {
      for (const [name, meta] of Object.entries(OFFICIAL_PLUGINS)) {
        console.log(`${chalk.cyan(`@evenlogix/stackchain-${name}`)}`);
        console.log(`  ${meta.description}`);
        console.log(`  install: stackchain plugin install ${name}`);
        console.log();
      }
    });
}
