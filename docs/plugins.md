# Plugin Development Guide

## Quick start

```bash
mkdir stackchain-plugin-acme && cd stackchain-plugin-acme
pnpm init
pnpm add @stackchain/sdk
```

`src/index.ts`:

```ts
import { definePlugin } from '@stackchain/sdk';

export default definePlugin({
  name: 'acme',
  version: '1.0.0',
  description: 'Acme Corp internal standards',
  generators: [
    {
      name: 'security-baseline',
      description: 'Apply Acme security defaults',
      async generate(context) {
        return {
          id: 'acme-security',
          kind: 'plugin',
          files: [
            {
              path: 'lib/core/security/security_policy.dart',
              content: '// Acme security policy for ${context.config.project.name}',
            },
          ],
        };
      },
    },
  ],
});
```

`stackchain.plugin.json`:

```json
{
  "name": "acme",
  "version": "1.0.0",
  "generators": [
    { "name": "security-baseline", "command": "add acme-security" }
  ]
}
```

## Enterprise plugins

Private plugins are first-class. Publish to a private npm registry:

```bash
stackchain plugin install @acme/stackchain-plugin-bank
```

Typical contents:

- Company architecture rules
- Security standards
- Internal API clients
- Custom templates
- Auth systems

## Official plugins

Install by short name:

```bash
stackchain plugin install firebase
# → @stackchain/firebase
```

See `packages/plugins/*` for reference implementations.
