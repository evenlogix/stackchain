import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Absolute path to the flutter template root (shipped next to this package). */
export function getFlutterTemplatesRoot(): string {
  return path.resolve(__dirname, '..', 'flutter');
}

export function getTemplatesRoot(): string {
  return path.resolve(__dirname, '..');
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
