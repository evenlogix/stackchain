import path from 'node:path';
import {
  assertValidProjectName,
  buildPackageIdentifier,
  toPascalCase,
  type CreateProjectOptions,
  type GeneratorContext,
  type StackChainConfig,
  type TemplateLayer,
} from '@evenlogix/stackchain-shared';
import { FileManager, GeneratorEngine, TemplateEngine } from '@evenlogix/stackchain-engine';
import {
  backendArchitecturePath,
  backendBasePath,
  backendIntegrationPath,
} from '@evenlogix/stackchain-templates';

export function buildBackendConfig(options: CreateProjectOptions): StackChainConfig {
  assertValidProjectName(options.name, 'npm');
  const packageId = buildPackageIdentifier(options.organization, options.name);

  return {
    version: 1,
    project: { name: options.name },
    organization: { identifier: options.organization },
    packageId,
    framework: 'backend',
    architecture: options.architecture,
    stateManagement: options.stateManagement ?? 'none',
    dependencyInjection: options.dependencyInjection ?? 'none',
    networking: options.networking,
    storage: options.storage,
    authentication: options.authentication,
    plugins: [],
  };
}

export function buildBackendVariables(config: StackChainConfig): Record<string, string> {
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

export class BackendProjectGenerator {
  private readonly templates = new TemplateEngine();
  private readonly engine = new GeneratorEngine();
  private readonly files = new FileManager();

  async create(
    options: CreateProjectOptions,
  ): Promise<{ projectRoot: string; config: StackChainConfig }> {
    const config = buildBackendConfig(options);
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
      variables: buildBackendVariables(config),
    };

    await this.engine.apply(plan, context);
    return { projectRoot, config };
  }

  private async resolveLayers(config: StackChainConfig): Promise<TemplateLayer[]> {
    const layers: TemplateLayer[] = [await this.templates.loadLayer(backendBasePath())];

    if (config.architecture !== 'custom') {
      const arch = await this.templates.loadOptionalLayer(
        backendArchitecturePath(String(config.architecture)),
      );
      if (arch) layers.push(arch);
    } else {
      const custom = await this.templates.loadOptionalLayer(backendArchitecturePath('custom'));
      if (custom) layers.push(custom);
    }

    const runtime = await this.templates.loadOptionalLayer(
      backendIntegrationPath('networking', String(config.networking)),
    );
    if (runtime) layers.push(runtime);

    const storage = await this.templates.loadOptionalLayer(
      backendIntegrationPath('storage', String(config.storage)),
    );
    if (storage) layers.push(storage);

    const auth = await this.templates.loadOptionalLayer(
      backendIntegrationPath('auth', String(config.authentication)),
    );
    if (auth) layers.push(auth);

    return layers;
  }
}
