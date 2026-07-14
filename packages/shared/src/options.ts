import type {
  ArchitectureId,
  AuthId,
  DependencyInjectionId,
  NetworkingId,
  StateManagementId,
  StorageId,
} from './types.js';

export interface ChoiceOption<T extends string = string> {
  name: string;
  value: T;
  description?: string;
}

export const ARCHITECTURE_OPTIONS: ChoiceOption<ArchitectureId>[] = [
  { name: 'Feature First', value: 'feature-first', description: 'Features own their UI and data' },
  {
    name: 'Clean Architecture',
    value: 'clean',
    description: 'Domain / data / presentation layers',
  },
  { name: 'MVVM', value: 'mvvm', description: 'Model–View–ViewModel' },
  { name: 'MVC', value: 'mvc', description: 'Model–View–Controller' },
  { name: 'Custom', value: 'custom', description: 'Minimal scaffold; bring your own structure' },
];

export const STATE_MANAGEMENT_OPTIONS: ChoiceOption<StateManagementId>[] = [
  { name: 'Bloc / Cubit', value: 'bloc' },
  { name: 'Riverpod', value: 'riverpod' },
  { name: 'Provider', value: 'provider' },
  { name: 'GetX', value: 'getx' },
  { name: 'MobX', value: 'mobx' },
  { name: 'Signals', value: 'signals' },
  { name: 'None', value: 'none' },
];

export const DI_OPTIONS: ChoiceOption<DependencyInjectionId>[] = [
  { name: 'get_it', value: 'get_it' },
  { name: 'injectable', value: 'injectable' },
  { name: 'Riverpod DI', value: 'riverpod' },
  { name: 'None', value: 'none' },
];

export const NETWORKING_OPTIONS: ChoiceOption<NetworkingId>[] = [
  { name: 'Dio', value: 'dio' },
  { name: 'Retrofit', value: 'retrofit' },
  { name: 'HTTP', value: 'http' },
];

export const STORAGE_OPTIONS: ChoiceOption<StorageId>[] = [
  { name: 'Hive', value: 'hive' },
  { name: 'Isar', value: 'isar' },
  { name: 'Drift', value: 'drift' },
  { name: 'Shared Preferences', value: 'shared_preferences' },
  { name: 'None', value: 'none' },
];

export const AUTH_OPTIONS: ChoiceOption<AuthId>[] = [
  { name: 'None', value: 'none' },
  { name: 'Firebase Auth', value: 'firebase' },
  { name: 'Custom JWT', value: 'jwt' },
  { name: 'OAuth', value: 'oauth' },
];
