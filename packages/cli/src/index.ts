#!/usr/bin/env node
import { buildProgram, printBanner } from './core/program.js';
import { registerCreateCommand } from './commands/create.js';
import { registerAddCommand } from './commands/add.js';
import { registerPluginCommand } from './commands/plugin.js';

async function main(): Promise<void> {
  const program = buildProgram();
  registerCreateCommand(program);
  registerAddCommand(program);
  registerPluginCommand(program);

  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printBanner();
  }

  await program.parseAsync(process.argv);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
