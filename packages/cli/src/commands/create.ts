import type { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { promptCreateFlutter } from '../prompts/create.js';
import { FlutterProjectGenerator } from '../generators/flutter-project.js';
import type {
  ArchitectureId,
  AuthId,
  DependencyInjectionId,
  NetworkingId,
  StateManagementId,
  StorageId,
} from '@stackchain/shared';

export function registerCreateCommand(program: Command): void {
  program
    .command('create')
    .description('Create a new project from composable architecture layers')
    .argument('<framework>', 'Target framework (flutter, react, backend)')
    .argument('<name>', 'Project / application name (e.g. banking_app)')
    .option('--org <organization>', 'Organization identifier (e.g. com.company)')
    .option('--architecture <architecture>', 'Architecture id')
    .option('--state <state>', 'State management id')
    .option('--di <di>', 'Dependency injection id')
    .option('--networking <networking>', 'Networking id')
    .option('--storage <storage>', 'Storage id')
    .option('--auth <auth>', 'Authentication id')
    .option('-y, --yes', 'Non-interactive; use defaults / flags', false)
    .option('--skip-flutter-create', 'Do not invoke flutter create', false)
    .action(async (framework: string, name: string, options) => {
      if (framework !== 'flutter') {
        console.error(
          chalk.yellow(
            `Framework "${framework}" is reserved for a future release. Currently supported: flutter`,
          ),
        );
        process.exitCode = 1;
        return;
      }

      try {
        const answers = await promptCreateFlutter({
          name,
          organization: options.org as string | undefined,
          architecture: options.architecture as ArchitectureId | undefined,
          stateManagement: options.state as StateManagementId | undefined,
          dependencyInjection: options.di as DependencyInjectionId | undefined,
          networking: options.networking as NetworkingId | undefined,
          storage: options.storage as StorageId | undefined,
          authentication: options.auth as AuthId | undefined,
          nonInteractive: Boolean(options.yes),
        });

        answers.skipFlutterCreate = Boolean(options.skipFlutterCreate);

        const spinner = ora('Composing architecture layers…').start();
        const generator = new FlutterProjectGenerator();
        const result = await generator.create(answers);
        spinner.succeed(`Created ${chalk.cyan(result.config.project.name)}`);

        console.log();
        console.log(chalk.bold('Package ID'), result.config.packageId);
        console.log(chalk.bold('Architecture'), result.config.architecture);
        console.log(chalk.bold('State'), result.config.stateManagement);
        console.log();
        console.log(chalk.dim('Next steps:'));
        console.log(`  cd ${result.config.project.name}`);
        console.log('  flutter pub get');
        console.log('  flutter run');
        console.log();
        console.log(chalk.dim('This app does not depend on StackChain at runtime.'));
      } catch (error) {
        console.error(chalk.red((error as Error).message));
        process.exitCode = 1;
      }
    });
}
