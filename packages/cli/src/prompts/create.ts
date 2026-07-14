import prompts from 'prompts';
import {
  ARCHITECTURE_OPTIONS,
  AUTH_OPTIONS,
  BACKEND_ARCHITECTURE_OPTIONS,
  BACKEND_AUTH_OPTIONS,
  BACKEND_RUNTIME_OPTIONS,
  BACKEND_STORAGE_OPTIONS,
  DI_OPTIONS,
  NETWORKING_OPTIONS,
  REACT_ARCHITECTURE_OPTIONS,
  REACT_AUTH_OPTIONS,
  REACT_NETWORKING_OPTIONS,
  REACT_STATE_OPTIONS,
  STATE_MANAGEMENT_OPTIONS,
  STORAGE_OPTIONS,
  buildPackageIdentifier,
  isValidNpmProjectName,
  isValidPackageSegment,
  type ArchitectureId,
  type AuthId,
  type CreateProjectOptions,
  type DependencyInjectionId,
  type NetworkingId,
  type StateManagementId,
  type StorageId,
} from '@evenlogix/stackchain-shared';

export interface CreatePromptDefaults {
  name: string;
  organization?: string;
  architecture?: ArchitectureId;
  stateManagement?: StateManagementId;
  dependencyInjection?: DependencyInjectionId;
  networking?: NetworkingId;
  storage?: StorageId;
  authentication?: AuthId;
  nonInteractive?: boolean;
}

function toChoices<T extends string>(
  options: Array<{ name: string; value: T }>,
): Array<{ title: string; value: T }> {
  return options.map((o) => ({ title: o.name, value: o.value }));
}

async function promptOrgAndApp(
  defaults: CreatePromptDefaults,
  nameStyle: 'dart' | 'npm',
): Promise<{ organization: string; application: string }> {
  const namePattern = nameStyle === 'npm' ? /^[a-z][a-z0-9_-]*$/ : /^[a-z][a-z0-9_]*$/;
  const nameHint =
    nameStyle === 'npm'
      ? 'Use lowercase letters, digits, hyphens, or underscores'
      : 'Use lowercase letters, digits, underscores';

  if (defaults.nonInteractive) {
    return {
      organization: defaults.organization ?? 'com.example',
      application: defaults.name,
    };
  }

  const answers = await prompts(
    [
      {
        type: defaults.organization ? null : 'text',
        name: 'organization',
        message: 'Organization identifier:',
        initial: 'com.company',
        validate: (value: string) => {
          const segments = value.trim().split('.');
          if (segments.length < 2 || !segments.every(isValidPackageSegment)) {
            return 'Use reverse-DNS format e.g. com.company';
          }
          return true;
        },
      },
      {
        type: 'text',
        name: 'application',
        message: 'Application identifier:',
        initial: defaults.name,
        validate: (value: string) => namePattern.test(value.trim()) || nameHint,
      },
    ],
    {
      onCancel: () => {
        throw new Error('Setup cancelled');
      },
    },
  );

  const organization = (defaults.organization ?? answers.organization) as string;
  const application = (answers.application as string) ?? defaults.name;
  const packageId = buildPackageIdentifier(organization, application);

  await prompts({
    type: 'confirm',
    name: 'confirmPackage',
    message: `Generated package: ${packageId}`,
    initial: true,
  });

  return { organization, application };
}

export async function promptCreateFlutter(
  defaults: CreatePromptDefaults,
): Promise<CreateProjectOptions> {
  if (defaults.nonInteractive) {
    const organization = defaults.organization ?? 'com.example';
    return {
      framework: 'flutter',
      name: defaults.name,
      organization,
      architecture: defaults.architecture ?? 'feature-first',
      stateManagement: defaults.stateManagement ?? 'bloc',
      dependencyInjection: defaults.dependencyInjection ?? 'get_it',
      networking: defaults.networking ?? 'dio',
      storage: defaults.storage ?? 'hive',
      authentication: defaults.authentication ?? 'none',
      nonInteractive: true,
    };
  }

  const { organization, application } = await promptOrgAndApp(defaults, 'dart');

  const answers = await prompts(
    [
      {
        type: 'select',
        name: 'architecture',
        message: 'Select architecture:',
        choices: toChoices(ARCHITECTURE_OPTIONS),
        initial: 0,
      },
      {
        type: 'select',
        name: 'stateManagement',
        message: 'Select state management:',
        choices: toChoices(STATE_MANAGEMENT_OPTIONS),
        initial: 0,
      },
      {
        type: 'select',
        name: 'dependencyInjection',
        message: 'Select dependency injection:',
        choices: toChoices(DI_OPTIONS),
        initial: 0,
      },
      {
        type: 'select',
        name: 'networking',
        message: 'Select networking:',
        choices: toChoices(NETWORKING_OPTIONS),
        initial: 0,
      },
      {
        type: 'select',
        name: 'localStorage',
        message: 'Select local storage:',
        choices: toChoices(STORAGE_OPTIONS),
        initial: 0,
      },
      {
        type: 'select',
        name: 'authentication',
        message: 'Select authentication:',
        choices: toChoices(AUTH_OPTIONS),
        initial: 0,
      },
    ],
    {
      onCancel: () => {
        throw new Error('Setup cancelled');
      },
    },
  );

  return {
    framework: 'flutter',
    name: application,
    organization,
    architecture: (defaults.architecture ?? answers.architecture) as ArchitectureId,
    stateManagement: (defaults.stateManagement ?? answers.stateManagement) as StateManagementId,
    dependencyInjection: (defaults.dependencyInjection ??
      answers.dependencyInjection) as DependencyInjectionId,
    networking: (defaults.networking ?? answers.networking) as NetworkingId,
    storage: (defaults.storage ?? answers.localStorage) as StorageId,
    authentication: (defaults.authentication ?? answers.authentication) as AuthId,
  };
}

export async function promptCreateReact(
  defaults: CreatePromptDefaults,
): Promise<CreateProjectOptions> {
  if (defaults.nonInteractive) {
    if (!isValidNpmProjectName(defaults.name)) {
      throw new Error(`Invalid project name "${defaults.name}"`);
    }
    return {
      framework: 'react',
      name: defaults.name,
      organization: defaults.organization ?? 'com.example',
      architecture: defaults.architecture ?? 'feature-first',
      stateManagement: defaults.stateManagement ?? 'zustand',
      dependencyInjection: 'none',
      networking: defaults.networking ?? 'fetch',
      storage: 'none',
      authentication: defaults.authentication ?? 'none',
      nonInteractive: true,
    };
  }

  const { organization, application } = await promptOrgAndApp(defaults, 'npm');

  const answers = await prompts(
    [
      {
        type: 'select',
        name: 'architecture',
        message: 'Select architecture:',
        choices: toChoices(REACT_ARCHITECTURE_OPTIONS),
        initial: 0,
      },
      {
        type: 'select',
        name: 'stateManagement',
        message: 'Select state management:',
        choices: toChoices(REACT_STATE_OPTIONS),
        initial: 0,
      },
      {
        type: 'select',
        name: 'networking',
        message: 'Select networking:',
        choices: toChoices(REACT_NETWORKING_OPTIONS),
        initial: 0,
      },
      {
        type: 'select',
        name: 'authentication',
        message: 'Select authentication:',
        choices: toChoices(REACT_AUTH_OPTIONS),
        initial: 0,
      },
    ],
    {
      onCancel: () => {
        throw new Error('Setup cancelled');
      },
    },
  );

  return {
    framework: 'react',
    name: application,
    organization,
    architecture: (defaults.architecture ?? answers.architecture) as ArchitectureId,
    stateManagement: (defaults.stateManagement ?? answers.stateManagement) as StateManagementId,
    dependencyInjection: 'none',
    networking: (defaults.networking ?? answers.networking) as NetworkingId,
    storage: 'none',
    authentication: (defaults.authentication ?? answers.authentication) as AuthId,
  };
}

export async function promptCreateBackend(
  defaults: CreatePromptDefaults,
): Promise<CreateProjectOptions> {
  if (defaults.nonInteractive) {
    if (!isValidNpmProjectName(defaults.name)) {
      throw new Error(`Invalid project name "${defaults.name}"`);
    }
    return {
      framework: 'backend',
      name: defaults.name,
      organization: defaults.organization ?? 'com.example',
      architecture: defaults.architecture ?? 'feature-first',
      stateManagement: 'none',
      dependencyInjection: 'none',
      networking: defaults.networking ?? 'hono',
      storage: defaults.storage ?? 'none',
      authentication: defaults.authentication ?? 'none',
      nonInteractive: true,
    };
  }

  const { organization, application } = await promptOrgAndApp(defaults, 'npm');

  const answers = await prompts(
    [
      {
        type: 'select',
        name: 'architecture',
        message: 'Select architecture:',
        choices: toChoices(BACKEND_ARCHITECTURE_OPTIONS),
        initial: 0,
      },
      {
        type: 'select',
        name: 'networking',
        message: 'Select runtime:',
        choices: toChoices(BACKEND_RUNTIME_OPTIONS),
        initial: 0,
      },
      {
        type: 'select',
        name: 'storage',
        message: 'Select database / ORM:',
        choices: toChoices(BACKEND_STORAGE_OPTIONS),
        initial: 2,
      },
      {
        type: 'select',
        name: 'authentication',
        message: 'Select authentication:',
        choices: toChoices(BACKEND_AUTH_OPTIONS),
        initial: 0,
      },
    ],
    {
      onCancel: () => {
        throw new Error('Setup cancelled');
      },
    },
  );

  return {
    framework: 'backend',
    name: application,
    organization,
    architecture: (defaults.architecture ?? answers.architecture) as ArchitectureId,
    stateManagement: 'none',
    dependencyInjection: 'none',
    networking: (defaults.networking ?? answers.networking) as NetworkingId,
    storage: (defaults.storage ?? answers.storage) as StorageId,
    authentication: (defaults.authentication ?? answers.authentication) as AuthId,
  };
}
