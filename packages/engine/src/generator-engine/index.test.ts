import { describe, expect, it } from 'vitest';
import { resolveVariables, collectUnresolvedVariables } from '../variable-resolver/index.js';
import { GeneratorEngine } from './index.js';
import type { TemplateLayer } from '@stackchain/shared';

describe('variable-resolver', () => {
  it('replaces variables', () => {
    expect(resolveVariables('hello {{ name }}', { name: 'world' })).toBe('hello world');
  });

  it('throws on missing variables', () => {
    expect(() => resolveVariables('{{missing}}', {})).toThrow(/Unresolved/);
  });

  it('collects unresolved keys', () => {
    expect(collectUnresolvedVariables('{{a}} and {{b}}')).toEqual(['a', 'b']);
  });
});

describe('GeneratorEngine.compose', () => {
  it('overlays layers later wins on same path', () => {
    const base: TemplateLayer = {
      id: 'base',
      kind: 'base',
      files: [{ path: 'lib/main.dart', content: 'base' }],
      dependencies: { equatable: '^2.0.0' },
    };
    const overlay: TemplateLayer = {
      id: 'bloc',
      kind: 'state-management',
      files: [{ path: 'lib/main.dart', content: 'bloc' }],
      dependencies: { flutter_bloc: '^9.0.0' },
    };

    const engine = new GeneratorEngine();
    const plan = engine.compose([base, overlay]);
    expect(plan.files).toHaveLength(1);
    expect(plan.files[0]?.content).toBe('bloc');
    expect(plan.dependencies).toEqual({
      equatable: '^2.0.0',
      flutter_bloc: '^9.0.0',
    });
  });
});
