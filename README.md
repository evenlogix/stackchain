# StackChain

**Encode proven engineering decisions into automation.**

StackChain is an open-source developer productivity platform that generates production-ready software foundations — not throwaway boilerplate.

The goal is simple: help teams create scalable, maintainable, production-grade projects without unnecessary complexity. StackChain is a development tool only; generated applications never depend on StackChain at runtime.

> Simple enough for beginners, powerful enough for enterprise.

## Vision

Tools like Vercel CLI, Nx, Angular CLI, Expo, Mason, and Create React App proved that great scaffolding changes how software gets built. StackChain extends that idea with **composable architecture layers**:

```
Architecture  +  State Management  +  Integrations  +  Feature Generators
     ↓                  ↓                  ↓                  ↓
              Production-ready project
```

No combinatorial template explosion (`flutter-clean-bloc`, `flutter-mvvm-riverpod`, …). Layers compose independently.

## Status

| Capability | Status |
|-----------|--------|
| Flutter project generation | ✅ Available |
| React / Next.js generation | ✅ Available |
| Backend / API generation | ✅ Available |
| Feature / component generators | ✅ Available (Flutter) |
| Plugin system + SDK | ✅ Available |
| Official ecosystem plugins | ✅ Scaffolded |
| DevOps / infrastructure | 🔜 Planned |

## Repository layout

```
stackchain/
├── packages/
│   ├── cli/              # stackchain CLI
│   ├── engine/           # generator, template, file, dependency, variables
│   ├── plugin-sdk/       # @evenlogix/stackchain-sdk
│   ├── templates/        # composable templates (flutter / react / backend)
│   ├── registry/         # plugin registry
│   ├── shared/           # shared types & validators
│   └── plugins/          # official @evenlogix/stackchain-* plugins
├── docs/
├── examples/
├── tests/
└── .github/workflows/
```

## Installation

### From npm (recommended)

```bash
npm install -g @evenlogix/stackchain

stackchain --help
stackchain doctor
```

### Prerequisites

- Node.js 20+
- Flutter SDK (recommended for full Android/iOS scaffolding)

### From source

```bash
git clone https://github.com/evenlogix/stackchain.git
cd stackchain
pnpm install
pnpm build
pnpm link --global ./packages/cli
```

### Usage without global link

```bash
pnpm stackchain --help
# or
node packages/cli/dist/bin.js --help
```

## CLI usage

### Create a Flutter app

```bash
stackchain create flutter banking_app
```

Interactive prompts:

- Organization identifier (`com.company`)
- Application identifier
- Architecture (Feature First, Clean, MVVM, MVC, Custom)
- State management (Bloc, Riverpod, Provider, GetX, MobX, Signals, None)
- Dependency injection
- Networking
- Local storage
- Authentication

Non-interactive:

```bash
stackchain create flutter banking_app \
  --org com.company \
  --architecture clean \
  --state bloc \
  --di get_it \
  --networking dio \
  --storage hive \
  --auth none \
  -y
```

### Create a React / Next.js app

```bash
stackchain create react web_app --org com.company -y
```

Composable layers: architecture (`feature-first`, `clean`, `custom`) + state (`zustand`, `redux`, `jotai`, `context`, `none`) + networking (`fetch`, `axios`, `ky`) + auth (`none`, `nextauth`, `jwt`, `oauth`).

```bash
stackchain create react dashboard \
  --org com.company \
  --architecture clean \
  --state zustand \
  --networking axios \
  --auth none \
  -y
```

### Create a Backend / API service

```bash
stackchain create backend api_service --org com.company -y
```

Composable layers: architecture + runtime (`hono`, `fastify`, `express`) + storage (`prisma`, `drizzle`, `none`) + auth (`none`, `jwt`, `oauth`).

```bash
stackchain create backend payments_api \
  --org com.company \
  --architecture feature-first \
  --networking hono \
  --storage prisma \
  --auth jwt \
  -y
```

### Package identifiers

StackChain configures Android `applicationId` and iOS `PRODUCT_BUNDLE_IDENTIFIER`.

```bash
stackchain create flutter my_app --org com.company -y
# → com.company.my_app
```

**Allowed:** `com.company.app`, `com.evenlogix.app`, `com.stackchain.product`  
**Rejected:** `Company.App`, `my app`, `123.company.app`, `company.app-name`

### Add features & components

Inside a generated project:

```bash
stackchain add feature payments
stackchain add screen login --feature authentication
stackchain add widget custom_button --feature authentication
stackchain add model user --feature authentication
stackchain add repository user --feature authentication
stackchain add datasource user_api --feature authentication
stackchain add usecase login --feature authentication
stackchain add service analytics
```

Example:

```bash
stackchain add usecase login --feature authentication
# → features/authentication/domain/usecases/login_usecase.dart
```

### Plugins

```bash
stackchain plugin official
stackchain plugin install firebase
stackchain plugin install supabase
stackchain plugin install company-security
stackchain plugin list
stackchain plugin uninstall firebase
```

## Architecture: composable layers

Templates live under `packages/templates/flutter/`:

```
architectures/          state-management/       integrations/
  clean/                  bloc/                   networking/dio
  mvvm/                   riverpod/               storage/hive
  mvc/                    provider/               di/get_it
  feature-first/          …                       auth/firebase
```

The engine:

1. Loads layers dynamically
2. Resolves `{{variables}}`
3. Writes files (later layers override earlier ones on the same path)
4. Merges `pubspec.yaml` dependencies
5. Runs optional post-generation hooks

## Configuration

Every generated project includes:

- `stackchain.config.ts` — human-readable team config
- `stackchain.config.json` — machine-readable twin for the CLI

```ts
export default {
  version: 1,
  project: { name: 'banking_app' },
  organization: { identifier: 'com.company' },
  packageId: 'com.company.banking_app',
  framework: 'flutter',
  architecture: 'clean',
  stateManagement: 'bloc',
  dependencyInjection: 'get_it',
  networking: 'dio',
  storage: 'hive',
  authentication: 'none',
  plugins: [],
};
```

This enables regeneration, upgrades, migrations, and internal standards — without coupling the app to StackChain.

## Plugin development

Install the SDK:

```bash
pnpm add @evenlogix/stackchain-sdk
```

```ts
import { definePlugin } from '@evenlogix/stackchain-sdk';

export default definePlugin({
  name: 'firebase',
  version: '1.0.0',
  generators: [
    {
      name: 'firebase-auth',
      generate: async (context) => ({
        id: 'firebase-auth',
        kind: 'plugin',
        files: [/* TemplateFile[] */],
        dependencies: { firebase_auth: '^5.0.0' },
      }),
    },
  ],
  commands: [{ name: 'firebase-auth', command: 'add firebase-auth' }],
});
```

Manifest (`stackchain.plugin.json`):

```json
{
  "name": "firebase",
  "version": "1.0.0",
  "generators": [{ "name": "firebase-auth", "command": "add firebase-auth" }]
}
```

Enterprise teams can publish private plugins (`stackchain-plugin-bank`) encoding company architecture, security, and internal APIs.

### Official ecosystem

| Package | Purpose |
|---------|---------|
| `@evenlogix/stackchain-flutter` | Flutter generators |
| `@evenlogix/stackchain-firebase` | Firebase integrations |
| `@evenlogix/stackchain-security` | Security baselines |
| `@evenlogix/stackchain-fintech` | Fintech scaffolds |
| `@evenlogix/stackchain-supabase` | Supabase integrations |

## Documentation

- [Architecture](docs/architecture.md)
- [Plugin development](docs/plugins.md)
- [Publishing to npm](docs/publishing.md)
- [CONTRIBUTING.md](CONTRIBUTING.md)
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [SECURITY.md](SECURITY.md)

## Roadmap

- [x] Monorepo + Turborepo foundation
- [x] Composable Flutter generator
- [x] Package identifier validation & platform patching
- [x] `add` component generators
- [x] Plugin SDK + registry
- [ ] React / Next.js generators
- [ ] Backend / API generators
- [ ] DevOps & infrastructure templates
- [ ] Template marketplace / remote registry
- [ ] Project upgrade & migration commands
- [ ] Custom architecture DSL

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). We use conventional commits and changesets for semantic versioning.

## Contact

- Email: [contact@evenlogix.com](mailto:contact@evenlogix.com)
- GitHub: [github.com/evenlogix/stackchain](https://github.com/evenlogix/stackchain)
- Website: [evenlogix.com](https://evenlogix.com)

## License

[MIT](LICENSE)
