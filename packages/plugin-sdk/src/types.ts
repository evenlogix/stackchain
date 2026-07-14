import type { GeneratorContext, TemplateLayer } from '@stackchain/shared';

export interface PluginCommand {
  name: string;
  description?: string;
  /** CLI fragment e.g. "add firebase-auth" */
  command: string;
  action?: (args: string[], context: PluginRuntimeContext) => Promise<void>;
}

export interface PluginGenerator {
  name: string;
  description?: string;
  generate: (
    context: GeneratorContext,
    args?: Record<string, string>,
  ) => Promise<TemplateLayer | TemplateLayer[]>;
}

export interface PluginRuntimeContext {
  cwd: string;
  pluginRoot: string;
}

export interface StackChainPlugin {
  name: string;
  version: string;
  description?: string;
  commands?: PluginCommand[];
  generators?: PluginGenerator[];
  /** Optional hook after project creation */
  onProjectCreated?: (context: GeneratorContext) => Promise<void>;
}

export interface PluginManifest {
  name: string;
  version: string;
  description?: string;
  main?: string;
  generators?: Array<{
    name: string;
    command: string;
    description?: string;
  }>;
  commands?: Array<{
    name: string;
    command: string;
    description?: string;
  }>;
}

export function definePlugin(plugin: StackChainPlugin): StackChainPlugin {
  if (!plugin.name) {
    throw new Error('Plugin must declare a name');
  }
  if (!plugin.version) {
    throw new Error(`Plugin "${plugin.name}" must declare a version`);
  }
  return plugin;
}
