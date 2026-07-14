import { describe, expect, it } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { OFFICIAL_PLUGINS, PluginRegistry } from './index.js';

describe('PluginRegistry', () => {
  it('installs and lists plugins', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'stackchain-reg-'));
    const registryPath = path.join(dir, 'registry.json');
    try {
      const registry = new PluginRegistry(registryPath);
      const installed = await registry.install('firebase');
      expect(installed.packageName).toBe(OFFICIAL_PLUGINS.firebase?.packageName);
      const listed = await registry.list();
      expect(listed).toHaveLength(1);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
