import path from 'node:path';
import { spawn } from 'node:child_process';
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
  flutterArchitecturePath,
  flutterBasePath,
  flutterIntegrationPath,
  flutterStateManagementPath,
} from '@stackchain/templates';

function commandExists(command: string): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn(command, ['--version'], { stdio: 'ignore', shell: true });
    child.on('error', () => resolve(false));
    child.on('close', (code) => resolve(code === 0));
  });
}

function run(command: string, args: string[], cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: 'inherit', shell: true });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(' ')} failed with code ${code}`));
    });
  });
}

export function buildConfig(options: CreateProjectOptions): StackChainConfig {
  assertValidProjectName(options.name);
  const packageId = buildPackageIdentifier(options.organization, options.name);

  return {
    version: 1,
    project: { name: options.name },
    organization: { identifier: options.organization },
    packageId,
    framework: options.framework,
    architecture: options.architecture,
    stateManagement: options.stateManagement,
    dependencyInjection: options.dependencyInjection,
    networking: options.networking,
    storage: options.storage,
    authentication: options.authentication,
    plugins: [],
  };
}

export function buildVariables(config: StackChainConfig): Record<string, string> {
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

export class FlutterProjectGenerator {
  private readonly templates = new TemplateEngine();
  private readonly engine = new GeneratorEngine();
  private readonly files = new FileManager();

  async create(
    options: CreateProjectOptions,
  ): Promise<{ projectRoot: string; config: StackChainConfig }> {
    const config = buildConfig(options);
    const cwd = path.resolve(options.cwd ?? process.cwd());
    const projectRoot = path.join(cwd, config.project.name);

    if (await this.files.exists(projectRoot)) {
      throw new Error(`Directory already exists: ${projectRoot}`);
    }

    const hasFlutter = !options.skipFlutterCreate && (await commandExists('flutter'));

    if (hasFlutter) {
      await run(
        'flutter',
        [
          'create',
          '--org',
          config.organization.identifier,
          '--project-name',
          config.project.name,
          config.project.name,
        ],
        cwd,
      );
    } else {
      await this.files.ensureDir(projectRoot);
      await this.files.ensureDir(path.join(projectRoot, 'android'));
      await this.files.ensureDir(path.join(projectRoot, 'ios'));
      await this.files.writeText(
        path.join(projectRoot, '.stackchain', 'NOTES.md'),
        [
          '# StackChain notes',
          '',
          'Flutter SDK was not detected during generation.',
          'Platform folders are placeholders. Run:',
          '',
          '```bash',
          `flutter create --org ${config.organization.identifier} --project-name ${config.project.name} .`,
          '```',
          '',
          'from the project root after installing Flutter (merge carefully with existing lib/).',
          '',
        ].join('\n'),
      );
    }

    const layers = await this.resolveLayers(config);
    const plan = this.engine.compose(layers);
    const context: GeneratorContext = {
      projectRoot,
      config,
      variables: buildVariables(config),
    };

    await this.engine.apply(plan, context);

    if (hasFlutter) {
      await this.patchPlatformIdentifiers(projectRoot, config.packageId);
    }

    return { projectRoot, config };
  }

  private async resolveLayers(config: StackChainConfig): Promise<TemplateLayer[]> {
    const layers: TemplateLayer[] = [];

    const base = await this.templates.loadLayer(flutterBasePath());
    layers.push(base);

    if (config.architecture !== 'custom') {
      const arch = await this.templates.loadOptionalLayer(
        flutterArchitecturePath(String(config.architecture)),
      );
      if (arch) layers.push(arch);
    }

    const state = await this.templates.loadOptionalLayer(
      flutterStateManagementPath(String(config.stateManagement)),
    );
    if (state) layers.push(state);

    const networking = await this.templates.loadOptionalLayer(
      flutterIntegrationPath('networking', String(config.networking)),
    );
    if (networking) layers.push(networking);

    const storage = await this.templates.loadOptionalLayer(
      flutterIntegrationPath('storage', String(config.storage)),
    );
    if (storage) layers.push(storage);

    const di = await this.templates.loadOptionalLayer(
      flutterIntegrationPath('di', String(config.dependencyInjection)),
    );
    if (di) layers.push(di);

    const auth = await this.templates.loadOptionalLayer(
      flutterIntegrationPath('auth', String(config.authentication)),
    );
    if (auth) layers.push(auth);

    return layers;
  }

  /**
   * Ensures Android applicationId / iOS PRODUCT_BUNDLE_IDENTIFIER match packageId.
   * flutter create --org usually sets this; we enforce for custom / overlay cases.
   */
  private async patchPlatformIdentifiers(projectRoot: string, packageId: string): Promise<void> {
    const gradlePath = path.join(projectRoot, 'android', 'app', 'build.gradle');
    const gradleKts = path.join(projectRoot, 'android', 'app', 'build.gradle.kts');

    for (const candidate of [gradlePath, gradleKts]) {
      if (await this.files.exists(candidate)) {
        let content = await this.files.readText(candidate);
        content = content.replace(
          /applicationId\s*=?\s*["'][^"']+["']/,
          candidate.endsWith('.kts')
            ? `applicationId = "${packageId}"`
            : `applicationId "${packageId}"`,
        );
        content = content.replace(
          /namespace\s*=?\s*["'][^"']+["']/,
          candidate.endsWith('.kts') ? `namespace = "${packageId}"` : `namespace "${packageId}"`,
        );
        await this.files.writeText(candidate, content);
      }
    }

    // Patch common iOS pbxproj bundle ids
    const iosDir = path.join(projectRoot, 'ios');
    if (await this.files.exists(iosDir)) {
      const { readdir } = await import('node:fs/promises');
      const walk = async (dir: string): Promise<string[]> => {
        const entries = await readdir(dir, { withFileTypes: true });
        const out: string[] = [];
        for (const entry of entries) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) out.push(...(await walk(full)));
          else if (entry.name.endsWith('.pbxproj')) out.push(full);
        }
        return out;
      };

      for (const pbx of await walk(iosDir)) {
        let content = await this.files.readText(pbx);
        content = content.replace(
          /PRODUCT_BUNDLE_IDENTIFIER = [^;]+;/g,
          `PRODUCT_BUNDLE_IDENTIFIER = ${packageId};`,
        );
        await this.files.writeText(pbx, content);
      }
    }
  }
}
