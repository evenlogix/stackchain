/** Programmatic StackChain CLI API. Prefer this entry for embedding or wrappers. */
import { buildProgram, printBanner } from './core/program.js';
import { registerCreateCommand } from './commands/create.js';
import { registerAddCommand } from './commands/add.js';
import { registerPluginCommand } from './commands/plugin.js';
import { registerDoctorCommand } from './commands/doctor.js';

export { CLI_VERSION } from './core/program.js';

export async function run(argv: string[] = process.argv): Promise<void> {
  const program = buildProgram();
  registerCreateCommand(program);
  registerAddCommand(program);
  registerPluginCommand(program);
  registerDoctorCommand(program);

  const args = argv.slice(2);
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printBanner();
  }

  await program.parseAsync(argv);
}
