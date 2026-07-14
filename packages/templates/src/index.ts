import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function getTemplatesRoot(): string {
  return path.resolve(__dirname, '..');
}

export function getFlutterTemplatesRoot(): string {
  return path.resolve(__dirname, '..', 'flutter');
}

export function getReactTemplatesRoot(): string {
  return path.resolve(__dirname, '..', 'react');
}

export function getBackendTemplatesRoot(): string {
  return path.resolve(__dirname, '..', 'backend');
}

export function flutterArchitecturePath(architecture: string): string {
  return path.join(getFlutterTemplatesRoot(), 'architectures', architecture);
}

export function flutterStateManagementPath(state: string): string {
  return path.join(getFlutterTemplatesRoot(), 'state-management', state);
}

export function flutterIntegrationPath(category: string, id: string): string {
  return path.join(getFlutterTemplatesRoot(), 'integrations', category, id);
}

export function flutterBasePath(): string {
  return path.join(getFlutterTemplatesRoot(), 'integrations', 'base');
}

export function reactArchitecturePath(architecture: string): string {
  return path.join(getReactTemplatesRoot(), 'architectures', architecture);
}

export function reactStateManagementPath(state: string): string {
  return path.join(getReactTemplatesRoot(), 'state-management', state);
}

export function reactIntegrationPath(category: string, id: string): string {
  return path.join(getReactTemplatesRoot(), 'integrations', category, id);
}

export function reactBasePath(): string {
  return path.join(getReactTemplatesRoot(), 'integrations', 'base');
}

export function backendArchitecturePath(architecture: string): string {
  return path.join(getBackendTemplatesRoot(), 'architectures', architecture);
}

export function backendIntegrationPath(category: string, id: string): string {
  return path.join(getBackendTemplatesRoot(), 'integrations', category, id);
}

export function backendBasePath(): string {
  return path.join(getBackendTemplatesRoot(), 'integrations', 'base');
}
