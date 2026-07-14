export type FrameworkId = 'flutter' | 'react' | 'backend' | string;

export type ArchitectureId = 'feature-first' | 'clean' | 'mvvm' | 'mvc' | 'custom' | string;

export type StateManagementId =
  'bloc' | 'riverpod' | 'provider' | 'getx' | 'mobx' | 'signals' | 'none' | string;

export type DependencyInjectionId = 'get_it' | 'injectable' | 'riverpod' | 'none' | string;

export type NetworkingId = 'dio' | 'retrofit' | 'http' | string;

export type StorageId = 'hive' | 'isar' | 'drift' | 'shared_preferences' | 'none' | string;

export type AuthId = 'none' | 'firebase' | 'jwt' | 'oauth' | string;

export interface ProjectOrganization {
  identifier: string;
}

export interface ProjectMeta {
  name: string;
}

/**
 * Project-local StackChain configuration.
 * Generated apps do NOT depend on StackChain at runtime — this file is tooling metadata only.
 */
export interface StackChainConfig {
  $schema?: string;
  version: number;
  project: ProjectMeta;
  organization: ProjectOrganization;
  packageId: string;
  framework: FrameworkId;
  architecture: ArchitectureId;
  stateManagement: StateManagementId;
  dependencyInjection: DependencyInjectionId;
  networking: NetworkingId;
  storage: StorageId;
  authentication: AuthId;
  plugins?: string[];
}

export interface CreateProjectOptions {
  framework: FrameworkId;
  name: string;
  organization: string;
  architecture: ArchitectureId;
  stateManagement: StateManagementId;
  dependencyInjection: DependencyInjectionId;
  networking: NetworkingId;
  storage: StorageId;
  authentication: AuthId;
  cwd?: string;
  skipFlutterCreate?: boolean;
  nonInteractive?: boolean;
}

export interface GeneratorContext {
  projectRoot: string;
  config: StackChainConfig;
  variables: Record<string, string>;
  dryRun?: boolean;
}

export interface TemplateFile {
  /** Relative path within the output project, may contain {{variables}}. */
  path: string;
  /** File contents with {{variable}} placeholders. */
  content: string;
  /** If true, skip writing when the destination already exists. */
  skipIfExists?: boolean;
}

export interface TemplateLayer {
  id: string;
  kind: 'architecture' | 'state-management' | 'integration' | 'feature' | 'base' | 'plugin';
  files: TemplateFile[];
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  postGenerate?: string[];
}

export interface GenerationPlan {
  layers: TemplateLayer[];
  files: TemplateFile[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  postGenerate: string[];
}

export type ComponentKind =
  'feature' | 'screen' | 'widget' | 'model' | 'repository' | 'datasource' | 'usecase' | 'service';

export interface AddComponentOptions {
  kind: ComponentKind;
  name: string;
  feature?: string;
  cwd?: string;
}
