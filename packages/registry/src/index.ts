import { readFile, mkdir, writeFile, access, constants } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import type { PluginManifest, StackChainPlugin } from '@stackchain/sdk';

export interface InstalledPlugin {
  name: string;
  version: string;
  packageName: string;
  path?: string;
  official?: boolean;
}

export interface RegistryState {
  version: number;
  plugins: InstalledPlugin[];
}

/** Official StackChain ecosystem packages */
export const OFFICIAL_PLUGINS: Record<string, { packageName: string; description: string }> = {
  flutter: {
    packageName: '@stackchain/flutter',
    description: 'Official Flutter generators and architecture layers',
  },
  firebase: {
    packageName: '@stackchain/firebase',
    description: 'Firebase Auth, Firestore, and Cloud Messaging integrations',
  },
  security: {
    packageName: '@stackchain/security',
    description: 'Security baselines and hardened defaults',
  },
  fintech: {
    packageName: '@stackchain/fintech',
    description: 'Fintech patterns and compliance-oriented scaffolds',
  },
  supabase: {
    packageName: '@stackchain/supabase',
    description: 'Supabase auth and data integrations',
  },
};

function defaultRegistryPath(): string {
  return path.join(os.homedir(), '.stackchain', 'registry.json');
}

export class PluginRegistry {
  constructor(private readonly registryPath = defaultRegistryPath()) {}

  async load(): Promise<RegistryState> {
    try {
      await access(this.registryPath, constants.F_OK);
      const raw = await readFile(this.registryPath, 'utf8');
      return JSON.parse(raw) as RegistryState;
    } catch {
      return { version: 1, plugins: [] };
    }
  }

  async save(state: RegistryState): Promise<void> {
    await mkdir(path.dirname(this.registryPath), { recursive: true });
    await writeFile(this.registryPath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
  }

  async list(): Promise<InstalledPlugin[]> {
    const state = await this.load();
    return state.plugins;
  }

  async install(name: string): Promise<InstalledPlugin> {
    const official = OFFICIAL_PLUGINS[name];
    const packageName =
      official?.packageName ?? (name.startsWith('@') ? name : `stackchain-plugin-${name}`);
    const plugin: InstalledPlugin = {
      name,
      version: '0.1.0',
      packageName,
      official: Boolean(official),
    };

    const state = await this.load();
    const existing = state.plugins.findIndex((p) => p.name === name);
    if (existing >= 0) {
      state.plugins[existing] = plugin;
    } else {
      state.plugins.push(plugin);
    }
    await this.save(state);
    return plugin;
  }

  async uninstall(name: string): Promise<boolean> {
    const state = await this.load();
    const next = state.plugins.filter((p) => p.name !== name);
    if (next.length === state.plugins.length) return false;
    state.plugins = next;
    await this.save(state);
    return true;
  }

  async readManifest(pluginRoot: string): Promise<PluginManifest> {
    const manifestPath = path.join(pluginRoot, 'stackchain.plugin.json');
    const raw = await readFile(manifestPath, 'utf8');
    return JSON.parse(raw) as PluginManifest;
  }

  /**
   * Dynamically import a plugin module that exports `default` as StackChainPlugin.
   */
  async loadPluginModule(modulePath: string): Promise<StackChainPlugin> {
    const mod = (await import(modulePath)) as {
      default?: StackChainPlugin;
      plugin?: StackChainPlugin;
    };
    const plugin = mod.default ?? mod.plugin;
    if (!plugin) {
      throw new Error(`Module ${modulePath} does not export a StackChainPlugin`);
    }
    return plugin;
  }
}
