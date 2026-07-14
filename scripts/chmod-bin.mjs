#!/usr/bin/env node
import { chmod } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const target = process.argv[2];
if (!target) {
  console.error('Usage: chmod-bin.mjs <path-from-repo-root>');
  process.exit(1);
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.resolve(root, target);
await chmod(file, 0o755);
