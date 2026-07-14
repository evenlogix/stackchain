import type { Command } from 'commander';
import chalk from 'chalk';
import { spawn } from 'node:child_process';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { findProjectRoot, loadStackChainConfig } from '../config/load-config.js';
import { CLI_VERSION } from '../core/program.js';

function which(command: string): Promise<boolean> {
  return new Promise((resolve) => {
    const checker = process.platform === 'win32' ? 'where' : 'which';
    const child = spawn(checker, [command], { stdio: 'ignore' });
    child.on('error', () => resolve(false));
    child.on('close', (code) => resolve(code === 0));
  });
}

function flutterVersion(): Promise<string | undefined> {
  return new Promise((resolve) => {
    const child = spawn('flutter', ['--version', '--machine'], {
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    let out = '';
    child.stdout?.on('data', (chunk: Buffer) => {
      out += chunk.toString();
    });
    child.on('error', () => resolve(undefined));
    child.on('close', (code) => {
      if (code !== 0) {
        resolve(undefined);
        return;
      }
      try {
        const parsed = JSON.parse(out) as { flutterVersion?: string };
        resolve(parsed.flutterVersion ?? out.trim().split('\n')[0]);
      } catch {
        resolve(out.trim().split('\n')[0]);
      }
    });
  });
}

export function registerDoctorCommand(program: Command): void {
  program
    .command('doctor')
    .description('Check local environment and optional project health')
    .action(async () => {
      console.log(chalk.bold(`StackChain doctor v${CLI_VERSION}`));
      console.log();

      const nodeOk = process.versions.node;
      console.log(chalk.green('✔'), `Node.js ${nodeOk}`);

      const hasFlutter = await which('flutter');
      if (hasFlutter) {
        const version = await flutterVersion();
        console.log(chalk.green('✔'), `Flutter ${version ?? 'detected'}`);
      } else {
        console.log(
          chalk.yellow('⚠'),
          'Flutter SDK not found — create will use --skip-flutter-create style placeholders for platforms',
        );
      }

      const hasDart = await which('dart');
      console.log(
        hasDart ? chalk.green('✔') : chalk.yellow('⚠'),
        hasDart ? 'Dart SDK detected' : 'Dart SDK not found on PATH',
      );

      const projectRoot = await findProjectRoot(process.cwd());
      if (!projectRoot) {
        console.log(chalk.dim('No stackchain.config.* in this directory tree.'));
        console.log();
        console.log(chalk.dim('Environment checks complete.'));
        return;
      }

      console.log(
        chalk.green('✔'),
        `Project config: ${path.relative(process.cwd(), projectRoot) || '.'}`,
      );

      try {
        const config = await loadStackChainConfig(projectRoot);
        console.log(chalk.green('✔'), `Framework: ${config.framework}`);
        console.log(chalk.green('✔'), `Package ID: ${config.packageId}`);
        console.log(chalk.green('✔'), `Architecture: ${config.architecture}`);

        const pubspec = path.join(projectRoot, 'pubspec.yaml');
        try {
          await access(pubspec);
          console.log(chalk.green('✔'), 'pubspec.yaml present');
        } catch {
          console.log(chalk.red('✖'), 'pubspec.yaml missing');
          process.exitCode = 1;
        }
      } catch (error) {
        console.log(chalk.red('✖'), (error as Error).message);
        process.exitCode = 1;
      }

      console.log();
      console.log(chalk.dim('Doctor finished.'));
    });
}
