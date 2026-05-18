# AGENTS

## Purpose
This repository builds a VS Code extension that patches VS Code runtime assets (CSS/JS/HTML/JSON) to apply custom UI styles.

Read first:
- [README.md](README.md)
- [src/path.ts](src/path.ts)
- [src/manager/index.ts](src/manager/index.ts)
- [src/manager/base.ts](src/manager/base.ts)

## Stack
- Runtime: Node.js + VS Code Extension API
- Language: TypeScript (CommonJS output)
- Build tool: `tsdown`
- Quality tools: `tsc`, `oxlint`, `oxfmt`
- Package manager/scripts: `bun`

## Commands
- Install deps: `bun install`
- Dev watch: `bun run dev`
- Typecheck: `bun run typecheck`
- Lint + format: `bun run oxc`
- Build: `bun run build`
- Regenerate extension metadata: `bun run update`

Before finishing code changes, run at least:
1. `bun run typecheck`
2. `bun run oxc`
3. `bun run build`

## Architecture Map
- `src/index.ts`: activation, commands, config-watch flow.
- `src/manager/base.ts`: shared backup/reload/rollback lifecycle.
- `src/manager/index.ts`: manager composition and restart strategy.
- `src/manager/*.ts`: concrete patching logic by target file type.
- `src/path.ts`: resolves VS Code installation paths and backup paths.
- `src/generated/meta.ts`: generated metadata; do not hand-edit.

## Repo-Specific Rules
- Keep `JsonFileManager` as the last built-in manager in `src/manager/index.ts` because checksum patching depends on prior modifications.
- Preserve backup semantics in `BaseFileManager`: patch from backup content, not from already-modified source.
- Backup extension suffix comes from generated meta name (currently `.custom-ui-style` behavior); do not hardcode a new suffix in random files.
- VS Code >= 1.95 uses ESM-related paths/behavior; avoid assuming only reload is enough. Respect restart flow in manager orchestration.
- If command/config metadata changes in `package.json`, regenerate `src/generated/meta.ts` with `bun run update`.

## Editing Guidance
- Prefer minimal, local changes in the relevant manager file instead of adding cross-cutting abstractions.
- Reuse existing helpers (`src/utils.ts`, cache/config modules) before introducing new utilities.
- Maintain current style conventions (simple naming, low complexity, straightforward control flow).

## Validation Notes
- There is no dedicated test suite in this repo; verification is command-based (`typecheck`, `oxc`, `build`).
- Runtime behavior depends on local VS Code installation files and may require elevated permissions.
