# Architecture

## Design goals

StackChain separates **what to generate** (templates / plugins) from **how to generate** (engine / CLI).

```
┌────────────┐     ┌──────────────┐     ┌─────────────────┐
│  CLI UX    │────▶│   Engine     │────▶│  Target project │
│  prompts   │     │  compose +   │     │  (no runtime    │
│  commands  │     │  apply       │     │   StackChain)   │
└────────────┘     └──────┬───────┘     └─────────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │  Templates   │
                   │  + Plugins   │
                   └──────────────┘
```

## Engine modules

| Module | Responsibility |
|--------|----------------|
| `template-engine` | Load `template.json` + `files/` from disk |
| `variable-resolver` | Replace `{{project_name}}` style tokens |
| `file-manager` | Create directories and write files |
| `dependency-manager` | Merge `pubspec.yaml` (and future manifests) |
| `generator-engine` | Compose layers and apply a generation plan |

## Layer composition

Layers are applied in order. When two layers ship the same relative path, the **later** layer wins. Dependencies are merged shallowly (later versions override).

Typical Flutter create pipeline:

1. `integrations/base`
2. `architectures/<id>`
3. `state-management/<id>`
4. `integrations/networking/<id>`
5. `integrations/storage/<id>`
6. `integrations/di/<id>`
7. `integrations/auth/<id>`

## Why not one template per combo?

`architectures × state × networking × storage × di × auth` explodes into hundreds of templates. Composition keeps the surface area linear and reviewable.

## Extensibility

External packages implement `StackChainPlugin` via `@stackchain/sdk` and register through `@stackchain/registry`. Enterprise plugins can encode private standards without forking the CLI.
