import { describe, expect, it } from 'vitest';
import { mkdtemp, readFile, rm, access } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const cliEntry = path.join(repoRoot, 'packages/cli/dist/bin.js');

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

describe('stackchain create', () => {
  it('composes flutter clean + bloc', async () => {
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
      const pubspec = await readFile(path.join(projectRoot, 'pubspec.yaml'), 'utf8');
      expect(pubspec).toContain('flutter_bloc');
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  });

  it('composes react next.js + zustand + axios', async () => {
    await access(cliEntry);
    const cwd = await mkdtemp(path.join(os.tmpdir(), 'stackchain-'));
    try {
      const result = await runStackChain(
        [
          'create',
          'react',
          'web_app',
          '--org',
          'com.company',
          '--architecture',
          'feature-first',
          '--state',
          'zustand',
          '--networking',
          'axios',
          '--auth',
          'none',
          '-y',
        ],
        cwd,
      );
      expect(result.code, result.stderr || result.stdout).toBe(0);
      const projectRoot = path.join(cwd, 'web_app');
      const pkg = JSON.parse(await readFile(path.join(projectRoot, 'package.json'), 'utf8')) as {
        dependencies: Record<string, string>;
      };
      expect(pkg.dependencies.next).toBeTruthy();
      expect(pkg.dependencies.zustand).toBeTruthy();
      expect(pkg.dependencies.axios).toBeTruthy();
      const page = await readFile(path.join(projectRoot, 'src/app/page.tsx'), 'utf8');
      expect(page).toContain('WebApp');
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  });

  it('composes backend hono + jwt', async () => {
    await access(cliEntry);
    const cwd = await mkdtemp(path.join(os.tmpdir(), 'stackchain-'));
    try {
      const result = await runStackChain(
        [
          'create',
          'backend',
          'api_service',
          '--org',
          'com.company',
          '--architecture',
          'feature-first',
          '--networking',
          'hono',
          '--storage',
          'none',
          '--auth',
          'jwt',
          '-y',
        ],
        cwd,
      );
      expect(result.code, result.stderr || result.stdout).toBe(0);
      const projectRoot = path.join(cwd, 'api_service');
      const pkg = JSON.parse(await readFile(path.join(projectRoot, 'package.json'), 'utf8')) as {
        dependencies: Record<string, string>;
      };
      expect(pkg.dependencies.hono).toBeTruthy();
      expect(pkg.dependencies.jose).toBeTruthy();
      const server = await readFile(path.join(projectRoot, 'src/server.ts'), 'utf8');
      expect(server).toContain('Hono');
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  });
});
