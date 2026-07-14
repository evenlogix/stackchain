import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { StackChainConfig } from '@stackchain/shared';
import { FileManager } from '@stackchain/engine';

const CONFIG_CANDIDATES = [
  'stackchain.config.ts',
  'stackchain.config.js',
  'stackchain.config.json',
];

export async function findProjectRoot(cwd: string): Promise<string | undefined> {
  let current = path.resolve(cwd);
  const fm = new FileManager();

  while (true) {
    for (const name of CONFIG_CANDIDATES) {
      if (await fm.exists(path.join(current, name))) {
        return current;
      }
    }
    const parent = path.dirname(current);
    if (parent === current) return undefined;
    current = parent;
  }
}

/**
 * Parse stackchain.config.ts / .json without evaluating TypeScript.
 * Supports the simple `export default { ... }` form we generate.
 */
export async function loadStackChainConfig(projectRoot: string): Promise<StackChainConfig> {
  const fm = new FileManager();

  const jsonPath = path.join(projectRoot, 'stackchain.config.json');
  if (await fm.exists(jsonPath)) {
    return JSON.parse(await fm.readText(jsonPath)) as StackChainConfig;
  }

  const tsPath = path.join(projectRoot, 'stackchain.config.ts');
  if (!(await fm.exists(tsPath))) {
    throw new Error(
      `No stackchain.config.ts found in ${projectRoot}. Run this command inside a StackChain project.`,
    );
  }

  const raw = await readFile(tsPath, 'utf8');
  const match = raw.match(/export\s+default\s+(\{[\s\S]*\});?\s*$/m);
  if (!match?.[1]) {
    throw new Error(`Unable to parse ${tsPath}. Expected \`export default { ... }\`.`);
  }

  // Lightweight transform: allow trailing commas and unquoted keys already valid in JS object literal via Function
  const objectLiteral = match[1]
    .replace(/(\w+)\s*:/g, '"$1":')
    .replace(/,\s*}/g, '}')
    .replace(/,\s*]/g, ']');

  try {
    const parsed = new Function(`return (${objectLiteral})`)() as StackChainConfig;
    return parsed;
  } catch (error) {
    throw new Error(`Failed to parse stackchain.config.ts: ${(error as Error).message}`);
  }
}

export function configToVariables(config: StackChainConfig): Record<string, string> {
  return {
    project_name: config.project.name,
    project_pascal: config.project.name
      .split(/[_-]/)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(''),
    organization: config.organization.identifier,
    package_id: config.packageId,
    architecture: String(config.architecture),
    state_management: String(config.stateManagement),
    dependency_injection: String(config.dependencyInjection),
    networking: String(config.networking),
    storage: String(config.storage),
    authentication: String(config.authentication),
  };
}
