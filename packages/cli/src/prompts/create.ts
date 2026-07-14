import prompts from 'prompts';
import {
  ARCHITECTURE_OPTIONS,
  AUTH_OPTIONS,
  DI_OPTIONS,
  NETWORKING_OPTIONS,
  STATE_MANAGEMENT_OPTIONS,
  STORAGE_OPTIONS,
  buildPackageIdentifier,
  isValidPackageSegment,
  type ArchitectureId,
  type AuthId,
  type CreateProjectOptions,
  type DependencyInjectionId,
  type NetworkingId,
  type StateManagementId,
  type StorageId,
} from '@stackchain/shared';

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
        validate: (value: string) =>
          /^[a-z][a-z0-9_]*$/.test(value.trim()) ||
          'Use lowercase letters, digits, underscores; must start with a letter',
      },
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

  const organization = (defaults.organization ?? answers.organization) as string;
  const application = (answers.application as string) ?? defaults.name;
  const packageId = buildPackageIdentifier(organization, application);

  // Show derived package id in interactive flows
  await prompts({
    type: 'confirm',
    name: 'confirmPackage',
    message: `Generated package: ${packageId}`,
    initial: true,
  });

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
