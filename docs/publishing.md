# Publishing StackChain to npm

Packages published in lockstep (same version):

| Package | Install |
|---------|---------|
| `stackchain` | `npm i -g stackchain` |
| `@stackchain/cli` | `npm i -g @stackchain/cli` |
| `@stackchain/engine` | dependency |
| `@stackchain/shared` | dependency |
| `@stackchain/templates` | dependency |
| `@stackchain/sdk` | dependency |
| `@stackchain/registry` | dependency |

Official plugin packages are `private` until ready.

## One-time npm setup

1. Create an npm account and verify email.
2. Create the **`@stackchain` organization** on npm (or ask npm support if the name is taken).
3. Add publish access for your user / automation token.
4. Create a granular access token with **read and write** for the organization.
5. Add repo secrets:
   - `NPM_TOKEN` — npm automation token

```bash
npm login
npm org ls stackchain
```

## Local dry-run

```bash
pnpm install
pnpm build
pnpm -r publish --dry-run --access public --no-git-checks
```

## First publish (manual)

```bash
pnpm install
pnpm build
pnpm changeset # if needed
pnpm version-packages
pnpm release
```

`pnpm release` runs `pnpm build && changeset publish`.

Or publish once without changesets (bootstrap):

```bash
pnpm build
pnpm --filter @stackchain/shared publish --access public
pnpm --filter @stackchain/engine publish --access public
pnpm --filter @stackchain/sdk publish --access public
pnpm --filter @stackchain/templates publish --access public
pnpm --filter @stackchain/registry publish --access public
pnpm --filter @stackchain/cli publish --access public
pnpm --filter stackchain publish --access public
```

Publish **dependencies first**, then the CLI, then the `stackchain` launcher.

## After publish

```bash
npm install -g stackchain
stackchain doctor
stackchain create flutter demo_app --org com.example -y
```

## Verify packed contents

```bash
pnpm --filter @stackchain/cli pack
pnpm --filter @stackchain/templates pack
tar -tzf stackchain-cli-*.tgz | head
tar -tzf stackchain-templates-*.tgz | head
```

Templates must include the `flutter/` directory inside `@stackchain/templates`.
