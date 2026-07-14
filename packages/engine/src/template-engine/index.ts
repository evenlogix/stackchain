import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import type { TemplateFile, TemplateLayer } from '@stackchain/shared';

export interface LoadedTemplate {
  root: string;
  meta: TemplateMeta;
  files: TemplateFile[];
}

export interface TemplateMeta {
  id: string;
  kind: TemplateLayer['kind'];
  name?: string;
  description?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  postGenerate?: string[];
}

const META_FILES = ['template.json', 'stackchain.template.json'];

/**
 * Loads template directories from disk.
 * Each template folder may contain template.json and any number of *.template / plain files.
 * Use `__path__` segments in filenames via path mapping in template.json files map,
 * or use {{variables}} directly in nested paths under `files/`.
 */
export class TemplateEngine {
  async loadLayer(templateDir: string): Promise<TemplateLayer> {
    const meta = await this.readMeta(templateDir);
    const filesRoot = path.join(templateDir, 'files');
    const files = (await this.exists(filesRoot))
      ? await this.collectFiles(filesRoot, filesRoot)
      : [];

    return {
      id: meta.id,
      kind: meta.kind,
      files,
      dependencies: meta.dependencies,
      devDependencies: meta.devDependencies,
      postGenerate: meta.postGenerate,
    };
  }

  async loadOptionalLayer(templateDir: string): Promise<TemplateLayer | undefined> {
    if (!(await this.exists(templateDir))) {
      return undefined;
    }
    return this.loadLayer(templateDir);
  }

  private async readMeta(templateDir: string): Promise<TemplateMeta> {
    for (const name of META_FILES) {
      const metaPath = path.join(templateDir, name);
      if (await this.exists(metaPath)) {
        const raw = await readFile(metaPath, 'utf8');
        const parsed = JSON.parse(raw) as TemplateMeta;
        if (!parsed.id || !parsed.kind) {
          throw new Error(`Invalid template meta at ${metaPath}: id and kind are required`);
        }
        return parsed;
      }
    }
    throw new Error(`No template.json found in ${templateDir}`);
  }

  private async collectFiles(dir: string, root: string): Promise<TemplateFile[]> {
    const entries = await readdir(dir, { withFileTypes: true });
    const files: TemplateFile[] = [];

    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await this.collectFiles(full, root)));
        continue;
      }

      let relativePath = path.relative(root, full).split(path.sep).join('/');
      // Support "foo.dart.template" → "foo.dart"
      if (relativePath.endsWith('.template')) {
        relativePath = relativePath.slice(0, -'.template'.length);
      }

      const content = await readFile(full, 'utf8');
      files.push({ path: relativePath, content });
    }

    return files;
  }

  private async exists(p: string): Promise<boolean> {
    try {
      await stat(p);
      return true;
    } catch {
      return false;
    }
  }
}
