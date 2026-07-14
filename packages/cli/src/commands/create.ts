import type { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { promptCreateBackend, promptCreateFlutter, promptCreateReact } from '../prompts/create.js';
import { FlutterProjectGenerator } from '../generators/flutter-project.js';
import { ReactProjectGenerator } from '../generators/react-project.js';
import { BackendProjectGenerator } from '../generators/backend-project.js';
import type {
  ArchitectureId,
  AuthId,
  CreateProjectOptions,
  DependencyInjectionId,
  NetworkingId,
  StateManagementId,
  StorageId,
} from '@evenlogix/stackchain-shared';

const SUPPORTED = new Set(['flutter', 'react', 'backend']);

function nextSteps(framework: string, name: string): string[] {
  if (framework === 'flutter') {
    return [`cd ${name}`, 'flutter pub get', 'flutter run'];
  }
  return [`cd ${name}`, 'npm install', 'npm run dev'];
}

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
    .option('--networking <networking>', 'Networking / runtime id')
    .option('--storage <storage>', 'Storage / ORM id')
    .option('--auth <auth>', 'Authentication id')
    .option('-y, --yes', 'Non-interactive; use defaults / flags', false)
    .option('--skip-flutter-create', 'Do not invoke flutter create (Flutter only)', false)
    .action(async (framework: string, name: string, options) => {
      if (!SUPPORTED.has(framework)) {
        console.error(
          chalk.yellow(`Unknown framework "${framework}". Supported: flutter, react, backend`),
        );
        process.exitCode = 1;
        return;
      }

      try {
        const defaults = {
          name,
          organization: options.org as string | undefined,
          architecture: options.architecture as ArchitectureId | undefined,
          stateManagement: options.state as StateManagementId | undefined,
          dependencyInjection: options.di as DependencyInjectionId | undefined,
          networking: options.networking as NetworkingId | undefined,
          storage: options.storage as StorageId | undefined,
          authentication: options.auth as AuthId | undefined,
          nonInteractive: Boolean(options.yes),
        };

        let answers: CreateProjectOptions;
        if (framework === 'flutter') {
          answers = await promptCreateFlutter(defaults);
          answers.skipFlutterCreate = Boolean(options.skipFlutterCreate);
        } else if (framework === 'react') {
          answers = await promptCreateReact(defaults);
        } else {
          answers = await promptCreateBackend(defaults);
        }

        const spinner = ora('Composing architecture layers…').start();

        const result =
          framework === 'flutter'
            ? await new FlutterProjectGenerator().create(answers)
            : framework === 'react'
              ? await new ReactProjectGenerator().create(answers)
              : await new BackendProjectGenerator().create(answers);

        spinner.succeed(`Created ${chalk.cyan(result.config.project.name)}`);

        console.log();
        console.log(chalk.bold('Framework'), result.config.framework);
        console.log(chalk.bold('Package ID'), result.config.packageId);
        console.log(chalk.bold('Architecture'), result.config.architecture);
        if (framework === 'backend') {
          console.log(chalk.bold('Runtime'), result.config.networking);
        } else {
          console.log(chalk.bold('State'), result.config.stateManagement);
        }
        console.log();
        console.log(chalk.dim('Next steps:'));
        for (const step of nextSteps(result.config.framework, result.config.project.name)) {
          console.log(`  ${step}`);
        }
        console.log();
        console.log(chalk.dim('This project does not depend on StackChain at runtime.'));
      } catch (error) {
        console.error(chalk.red((error as Error).message));
        process.exitCode = 1;
      }
    });
}
