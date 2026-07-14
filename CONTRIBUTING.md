# Contributing to StackChain

Thanks for helping build the open-source standard for production software foundations.

## Principles

1. **Plugins first** — prefer extending via plugins/templates over hardcoding in the CLI.
2. **Compose, don't multiply** — never create combinatorial templates (`flutter-clean-bloc`).
3. **Generated apps stay free** — no StackChain runtime dependency in output projects.
4. **Simple over clever** — avoid unnecessary abstractions.

## Development setup

```bash
pnpm install
pnpm build
pnpm test
```

Run the CLI locally:

```bash
pnpm stackchain create flutter demo_app --org com.example -y --skip-flutter-create
```

## Project structure

| Package | Role |
|---------|------|
| `@evenlogix/stackchain-cli` | User-facing CLI |
| `@evenlogix/stackchain-engine` | Generators, templates, files, deps, variables |
| `@evenlogix/stackchain-sdk` | Plugin authoring SDK |
| `@evenlogix/stackchain-templates` | Composable template layers |
| `@evenlogix/stackchain-registry` | Plugin install / discovery |
| `@evenlogix/stackchain-shared` | Shared types & validators |
| `@evenlogix/stackchain-*` plugins | Official ecosystem |

## Commit convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(cli): add usecase generator paths for clean architecture
fix(engine): resolve nested template variables
docs: clarify plugin manifesto format
```

## Pull requests

1. Keep PRs focused.
2. Add unit tests for shared/engine changes.
3. Update docs when changing CLI UX.
4. Run `pnpm build && pnpm test && pnpm lint` before opening a PR.

## Releases

Versions are managed with [Changesets](https://github.com/changesets/changesets):

```bash
pnpm changeset
pnpm version-packages
pnpm release
```

## Code of conduct

Participation is governed by our [Code of Conduct](CODE_OF_CONDUCT.md).
