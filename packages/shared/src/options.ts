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

/** React / Next.js option sets */
export const REACT_ARCHITECTURE_OPTIONS: ChoiceOption<ArchitectureId>[] = [
  { name: 'Feature First', value: 'feature-first' },
  { name: 'Clean Architecture', value: 'clean' },
  { name: 'Custom', value: 'custom' },
];

export const REACT_STATE_OPTIONS: ChoiceOption<StateManagementId>[] = [
  { name: 'Zustand', value: 'zustand' },
  { name: 'Redux Toolkit', value: 'redux' },
  { name: 'Jotai', value: 'jotai' },
  { name: 'React Context', value: 'context' },
  { name: 'None', value: 'none' },
];

export const REACT_NETWORKING_OPTIONS: ChoiceOption<NetworkingId>[] = [
  { name: 'Fetch', value: 'fetch' },
  { name: 'Axios', value: 'axios' },
  { name: 'Ky', value: 'ky' },
];

export const REACT_AUTH_OPTIONS: ChoiceOption<AuthId>[] = [
  { name: 'None', value: 'none' },
  { name: 'NextAuth.js', value: 'nextauth' },
  { name: 'Custom JWT', value: 'jwt' },
  { name: 'OAuth', value: 'oauth' },
];

/** Backend / API option sets */
export const BACKEND_ARCHITECTURE_OPTIONS: ChoiceOption<ArchitectureId>[] = [
  { name: 'Feature First', value: 'feature-first' },
  { name: 'Clean Architecture', value: 'clean' },
  { name: 'MVC', value: 'mvc' },
  { name: 'Custom', value: 'custom' },
];

export const BACKEND_RUNTIME_OPTIONS: ChoiceOption<NetworkingId>[] = [
  { name: 'Hono', value: 'hono' },
  { name: 'Fastify', value: 'fastify' },
  { name: 'Express', value: 'express' },
];

export const BACKEND_STORAGE_OPTIONS: ChoiceOption<StorageId>[] = [
  { name: 'Prisma', value: 'prisma' },
  { name: 'Drizzle', value: 'drizzle' },
  { name: 'None', value: 'none' },
];

export const BACKEND_AUTH_OPTIONS: ChoiceOption<AuthId>[] = [
  { name: 'None', value: 'none' },
  { name: 'JWT', value: 'jwt' },
  { name: 'OAuth', value: 'oauth' },
];
