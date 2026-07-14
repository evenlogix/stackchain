import path from 'node:path';
import {
  assertValidProjectName,
  buildPackageIdentifier,
  toPascalCase,
  type CreateProjectOptions,
  type GeneratorContext,
  type StackChainConfig,
  type TemplateLayer,
} from '@stackchain/shared';
import { FileManager, GeneratorEngine, TemplateEngine } from '@stackchain/engine';
import {
  reactArchitecturePath,
  reactBasePath,
  reactIntegrationPath,
  reactStateManagementPath,
} from '@stackchain/templates';

export function buildReactConfig(options: CreateProjectOptions): StackChainConfig {
  assertValidProjectName(options.name, 'npm');
  const packageId = buildPackageIdentifier(options.organization, options.name);

  return {
    version: 1,
    project: { name: options.name },
    organization: { identifier: options.organization },
    packageId,
    framework: 'react',
    architecture: options.architecture,
    stateManagement: options.stateManagement,
    dependencyInjection: options.dependencyInjection ?? 'none',
    networking: options.networking,
    storage: options.storage ?? 'none',
    authentication: options.authentication,
    plugins: [],
  };
}

export function buildReactVariables(config: StackChainConfig): Record<string, string> {
  return {
    project_name: config.project.name,
    project_pascal: toPascalCase(config.project.name),
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

export class ReactProjectGenerator {
  private readonly templates = new TemplateEngine();
  private readonly engine = new GeneratorEngine();
  private readonly files = new FileManager();

  async create(
    options: CreateProjectOptions,
  ): Promise<{ projectRoot: string; config: StackChainConfig }> {
    const config = buildReactConfig(options);
    const cwd = path.resolve(options.cwd ?? process.cwd());
    const projectRoot = path.join(cwd, config.project.name);

    if (await this.files.exists(projectRoot)) {
      throw new Error(`Directory already exists: ${projectRoot}`);
    }

    await this.files.ensureDir(projectRoot);

    const layers = await this.resolveLayers(config);
    const plan = this.engine.compose(layers);
    const context: GeneratorContext = {
      projectRoot,
      config,
      variables: buildReactVariables(config),
    };

    await this.engine.apply(plan, context);
    return { projectRoot, config };
  }

  private async resolveLayers(config: StackChainConfig): Promise<TemplateLayer[]> {
    const layers: TemplateLayer[] = [await this.templates.loadLayer(reactBasePath())];

    if (config.architecture !== 'custom') {
      const arch = await this.templates.loadOptionalLayer(
        reactArchitecturePath(String(config.architecture)),
      );
      if (arch) layers.push(arch);
    } else {
      const custom = await this.templates.loadOptionalLayer(reactArchitecturePath('custom'));
      if (custom) layers.push(custom);
    }

    const state = await this.templates.loadOptionalLayer(
      reactStateManagementPath(String(config.stateManagement)),
    );
    if (state) layers.push(state);

    const networking = await this.templates.loadOptionalLayer(
      reactIntegrationPath('networking', String(config.networking)),
    );
    if (networking) layers.push(networking);

    const auth = await this.templates.loadOptionalLayer(
      reactIntegrationPath('auth', String(config.authentication)),
    );
    if (auth) layers.push(auth);

    return layers;
  }
}
