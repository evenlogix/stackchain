# Publishing StackChain to npm

Packages published in lockstep (same version):

| Package | Install |
|---------|---------|
| `@evenlogix/stackchain` | `npm i -g @evenlogix/stackchain` |
| `@evenlogix/stackchain-cli` | dependency (or `npm i -g @evenlogix/stackchain-cli`) |
| `@evenlogix/stackchain-engine` | dependency |
| `@evenlogix/stackchain-shared` | dependency |
| `@evenlogix/stackchain-templates` | dependency |
| `@evenlogix/stackchain-sdk` | dependency |
| `@evenlogix/stackchain-registry` | dependency |

Official plugin packages are `private` until ready.

## One-time npm setup

1. Create an npm account and verify email.
2. Ensure you have publish access to the **`@evenlogix` organization** on npm.
3. Add publish access for your user / automation token.
4. Create a granular access token with **read and write** for the organization.
5. Add repo secrets:
   - `NPM_TOKEN` — npm automation token

```bash
npm login
npm org ls evenlogix
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
pnpm --filter @evenlogix/stackchain-shared publish --access public --no-git-checks
pnpm --filter @evenlogix/stackchain-engine publish --access public --no-git-checks
pnpm --filter @evenlogix/stackchain-sdk publish --access public --no-git-checks
pnpm --filter @evenlogix/stackchain-templates publish --access public --no-git-checks
pnpm --filter @evenlogix/stackchain-registry publish --access public --no-git-checks
pnpm --filter @evenlogix/stackchain-cli publish --access public --no-git-checks
pnpm --filter @evenlogix/stackchain publish --access public --no-git-checks
```

Publish **dependencies first**, then the CLI, then the `@evenlogix/stackchain` launcher.

## After publish

```bash
npm install -g @evenlogix/stackchain
stackchain doctor
stackchain create flutter demo_app --org com.example -y
```

## Verify packed contents

```bash
pnpm --filter @evenlogix/stackchain-cli pack
pnpm --filter @evenlogix/stackchain-templates pack
tar -tzf evenlogix-stackchain-cli-*.tgz | head
tar -tzf evenlogix-stackchain-templates-*.tgz | head
```

Templates must include the `flutter/` directory inside `@evenlogix/stackchain-templates`.
