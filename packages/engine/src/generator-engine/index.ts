import path from 'node:path';
import { spawn } from 'node:child_process';
import type {
  GenerationPlan,
  GeneratorContext,
  TemplateFile,
  TemplateLayer,
} from '@stackchain/shared';
import { FileManager } from '../file-manager/index.js';
import { DependencyManager } from '../dependency-manager/index.js';
import { resolveTemplateFile, type VariableMap } from '../variable-resolver/index.js';

export interface GeneratorEngineOptions {
  fileManager?: FileManager;
  dependencyManager?: DependencyManager;
}

export interface ApplyResult {
  written: string[];
  skipped: string[];
}

export class GeneratorEngine {
  private readonly files: FileManager;
  private readonly deps: DependencyManager;

  constructor(options: GeneratorEngineOptions = {}) {
    this.files = options.fileManager ?? new FileManager();
    this.deps = options.dependencyManager ?? new DependencyManager(this.files);
  }

  compose(layers: TemplateLayer[]): GenerationPlan {
    const fileMap = new Map<string, TemplateFile>();
    const dependencies: Record<string, string> = {};
    const devDependencies: Record<string, string> = {};
    const postGenerate: string[] = [];

    for (const layer of layers) {
      for (const file of layer.files) {
        fileMap.set(file.path, file);
      }
      Object.assign(dependencies, layer.dependencies ?? {});
      Object.assign(devDependencies, layer.devDependencies ?? {});
      postGenerate.push(...(layer.postGenerate ?? []));
    }

    return {
      layers,
      files: [...fileMap.values()],
      dependencies,
      devDependencies,
      postGenerate,
    };
  }

  async apply(plan: GenerationPlan, context: GeneratorContext): Promise<ApplyResult> {
    const variables: VariableMap = context.variables;
    const written: string[] = [];
    const skipped: string[] = [];

    await this.files.ensureDir(context.projectRoot);

    for (const file of plan.files) {
      const resolved = resolveTemplateFile(file, variables);
      const absolute = path.join(context.projectRoot, resolved.path);
      const didWrite = await this.files.writeText(absolute, resolved.content, {
        skipIfExists: file.skipIfExists,
        dryRun: context.dryRun,
      });
      if (didWrite) {
        written.push(resolved.path);
      } else {
        skipped.push(resolved.path);
      }
    }

    if (
      !context.dryRun &&
      (Object.keys(plan.dependencies).length || Object.keys(plan.devDependencies).length)
    ) {
      await this.deps.updateManifest(context.projectRoot, {
        dependencies: plan.dependencies,
        devDependencies: plan.devDependencies,
      });
    }

    if (!context.dryRun) {
      for (const command of plan.postGenerate) {
        const resolved = resolveTemplateFile({ path: 'post', content: command }, variables).content;
        await this.runCommand(resolved, context.projectRoot);
      }
    }

    return { written, skipped };
  }

  private runCommand(command: string, cwd: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, {
        cwd,
        shell: true,
        stdio: 'inherit',
      });
      child.on('error', reject);
      child.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Post-generate command failed (${code}): ${command}`));
      });
    });
  }
}
