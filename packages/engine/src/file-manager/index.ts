import { mkdir, readFile, writeFile, access, constants } from 'node:fs/promises';
import path from 'node:path';

export interface WriteFileOptions {
  skipIfExists?: boolean;
  dryRun?: boolean;
}

export class FileManager {
  async exists(filePath: string): Promise<boolean> {
    try {
      await access(filePath, constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  async ensureDir(dirPath: string): Promise<void> {
    await mkdir(dirPath, { recursive: true });
  }

  async writeText(
    filePath: string,
    content: string,
    options: WriteFileOptions = {},
  ): Promise<boolean> {
    if (options.skipIfExists && (await this.exists(filePath))) {
      return false;
    }

    if (options.dryRun) {
      return true;
    }

    await this.ensureDir(path.dirname(filePath));
    await writeFile(filePath, content, 'utf8');
    return true;
  }

  async readText(filePath: string): Promise<string> {
    return readFile(filePath, 'utf8');
  }

  async writeJson(
    filePath: string,
    value: unknown,
    options: WriteFileOptions = {},
  ): Promise<boolean> {
    const content = `${JSON.stringify(value, null, 2)}\n`;
    return this.writeText(filePath, content, options);
  }
}
