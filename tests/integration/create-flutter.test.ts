import { describe, expect, it } from 'vitest';
import { mkdtemp, readFile, rm, access } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const cliEntry = path.join(repoRoot, 'packages/cli/dist/index.js');

function runStackChain(
  args: string[],
  cwd: string,
): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cliEntry, ...args], {
      cwd,
      env: { ...process.env, FORCE_COLOR: '0' },
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d: Buffer) => {
      stdout += d.toString();
    });
    child.stderr.on('data', (d: Buffer) => {
      stderr += d.toString();
    });
    child.on('error', reject);
    child.on('close', (code) => resolve({ stdout, stderr, code: code ?? 1 }));
  });
}

describe('stackchain create flutter', () => {
  it('composes clean + bloc + dio + hive + get_it', async () => {
    await access(cliEntry);

    const cwd = await mkdtemp(path.join(os.tmpdir(), 'stackchain-'));
    try {
      const result = await runStackChain(
        [
          'create',
          'flutter',
          'banking_app',
          '--org',
          'com.company',
          '--architecture',
          'clean',
          '--state',
          'bloc',
          '--di',
          'get_it',
          '--networking',
          'dio',
          '--storage',
          'hive',
          '--auth',
          'none',
          '-y',
          '--skip-flutter-create',
        ],
        cwd,
      );

      expect(result.code, result.stderr || result.stdout).toBe(0);

      const projectRoot = path.join(cwd, 'banking_app');
      const main = await readFile(path.join(projectRoot, 'lib/main.dart'), 'utf8');
      expect(main).toContain('BankingApp');

      const config = JSON.parse(
        await readFile(path.join(projectRoot, 'stackchain.config.json'), 'utf8'),
      ) as { packageId: string; architecture: string };
      expect(config.packageId).toBe('com.company.banking_app');
      expect(config.architecture).toBe('clean');

      const pubspec = await readFile(path.join(projectRoot, 'pubspec.yaml'), 'utf8');
      expect(pubspec).toContain('flutter_bloc');
      expect(pubspec).toContain('dio:');
      expect(pubspec).toContain('hive:');
      expect(pubspec).toContain('get_it:');

      const add = await runStackChain(
        ['add', 'usecase', 'logout', '--feature', 'authentication'],
        projectRoot,
      );
      expect(add.code, add.stderr || add.stdout).toBe(0);

      const usecase = await readFile(
        path.join(projectRoot, 'lib/features/authentication/domain/usecases/logout_usecase.dart'),
        'utf8',
      );
      expect(usecase).toContain('LogoutUseCase');
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  });
});
