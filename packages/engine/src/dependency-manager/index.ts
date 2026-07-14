import { FileManager } from '../file-manager/index.js';
import path from 'node:path';

export interface ManifestUpdate {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

/** @deprecated Use ManifestUpdate */
export type PubspecUpdate = ManifestUpdate;

/**
 * Merges dependencies into pubspec.yaml or package.json depending on project type.
 */
export class DependencyManager {
  constructor(private readonly files = new FileManager()) {}

  async updateManifest(projectRoot: string, update: ManifestUpdate): Promise<void> {
    const pubspec = path.join(projectRoot, 'pubspec.yaml');
    const packageJson = path.join(projectRoot, 'package.json');

    if (await this.files.exists(pubspec)) {
      await this.updatePubspec(projectRoot, update);
      return;
    }
    if (await this.files.exists(packageJson)) {
      await this.updatePackageJson(projectRoot, update);
    }
  }

  async updatePubspec(projectRoot: string, update: ManifestUpdate): Promise<void> {
    const pubspecPath = path.join(projectRoot, 'pubspec.yaml');
    if (!(await this.files.exists(pubspecPath))) {
      throw new Error(`pubspec.yaml not found at ${pubspecPath}`);
    }

    let content = await this.files.readText(pubspecPath);
    content = this.mergeSection(content, 'dependencies', update.dependencies ?? {});
    content = this.mergeSection(content, 'dev_dependencies', update.devDependencies ?? {});
    await this.files.writeText(pubspecPath, content);
  }

  async updatePackageJson(projectRoot: string, update: ManifestUpdate): Promise<void> {
    const packageJsonPath = path.join(projectRoot, 'package.json');
    if (!(await this.files.exists(packageJsonPath))) {
      throw new Error(`package.json not found at ${packageJsonPath}`);
    }

    const raw = await this.files.readText(packageJsonPath);
    const pkg = JSON.parse(raw) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    pkg.dependencies = { ...(pkg.dependencies ?? {}), ...(update.dependencies ?? {}) };
    pkg.devDependencies = { ...(pkg.devDependencies ?? {}), ...(update.devDependencies ?? {}) };

    await this.files.writeText(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`);
  }

  private mergeSection(
    content: string,
    section: 'dependencies' | 'dev_dependencies',
    deps: Record<string, string>,
  ): string {
    const entries = Object.entries(deps);
    if (entries.length === 0) return content;

    const sectionRegex = new RegExp(`^${section}:\\s*$`, 'm');
    if (!sectionRegex.test(content)) {
      const block = [`${section}:`, ...entries.map(([k, v]) => `  ${k}: ${v}`)].join('\n');
      return `${content.trimEnd()}\n\n${block}\n`;
    }

    const lines = content.split('\n');
    const sectionIndex = lines.findIndex((line) => line.trim() === `${section}:`);
    if (sectionIndex === -1) return content;

    let insertAt = sectionIndex + 1;
    while (insertAt < lines.length) {
      const line = lines[insertAt]!;
      if (line.length > 0 && !/^\s/.test(line) && !line.trim().startsWith('#')) {
        break;
      }
      insertAt += 1;
    }

    for (const [name, version] of entries) {
      const existingIndex = lines.findIndex(
        (line, idx) =>
          idx > sectionIndex && idx < insertAt && new RegExp(`^\\s+${name}:`).test(line),
      );
      const entry = `  ${name}: ${version}`;
      if (existingIndex !== -1) {
        lines[existingIndex] = entry;
      } else {
        lines.splice(insertAt, 0, entry);
        insertAt += 1;
      }
    }

    return lines.join('\n');
  }
}
