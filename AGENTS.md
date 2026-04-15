# AGENTS.md

This file provides instructions for agentic coding assistants working in this repository.

## Development Commands

### Build & Typecheck
- `pnpm run build` - Typecheck and compile (minified, treeshaken)
- `pnpm run typecheck` - Run TypeScript type checking without emitting files
- `pnpm run dev` - Watch mode for development

### Linting & Formatting
- `pnpm run format` - Run ESLint with auto-fix (this is the lint command)
- Note: No separate lint command - use `pnpm run format` to check and fix issues

### Testing
- No test framework is configured in this project
- Manual testing is done by building and loading the VSCode extension

### Publishing
- `pnpm run publish` - Publish to VSCode marketplace
- `pnpm run pack` - Package extension locally
- `pnpm run release` - Format, build, and bump version

### Other Commands
- `pnpm run update` - Generate TypeScript meta types from package.json config
- `pnpm run prepare` - Runs update (automatically on install)

## Code Style Guidelines

### Imports
- Use ES6 import/export syntax
- Import types with `import type { ... }` for type-only imports
- Use namespace imports with `* as` for groups of related exports
- Group imports: external libraries (reactive-vscode, vscode), then local modules
- Use default imports for single functions when appropriate

```typescript
import type { FileManager } from './base'

import { defineExtension, useCommand } from 'reactive-vscode'
import { workspace } from 'vscode'

import * as Meta from './generated/meta'
```

### Formatting
- Indentation: 2 spaces
- Double quotes for strings
- Semicolons required
- No trailing whitespace
- Single quotes used for escaping within double-quoted strings
- Consistent spacing around operators and after commas

### Types
- TypeScript strict mode enabled
- Define interfaces for custom types
- Use generic types from `@subframe7536/type-utils` (e.g., `Promisable`, `AnyFunction`)
- Type function parameters explicitly when not inferred
- Use generic types for flexible function signatures
- Return types inferred unless complex or public API

### Naming Conventions
- camelCase for variables, functions, methods, and object properties
- PascalCase for classes and interfaces
- UPPER_SNAKE_CASE for constants (e.g., `fileProtocol`, `httpsProtocol`)
- Descriptive names: `hasBakFile`, `runAndRestart`, `generateStyleFromObject`
- Prefix boolean predicates with `is`, `has`, `can`, or similar (e.g., `isVSCodeUsingESM`)

### Error Handling
- Use try/catch blocks for error-prone operations
- Check `error instanceof Error` before accessing error properties
- Use the centralized `logError()` utility function from `utils.ts`
- Log errors using the custom logger: `log.error()`, `log.warn()`, `log.info()`
- Show user-facing messages with `showMessage()` for errors affecting users
- Never silently swallow errors - always log them

### Async/Await
- Use async/await for asynchronous operations
- Prefer explicit async functions over callbacks
- Use `Promise.all()` for parallel operations when order doesn't matter
- Handle lock files when modifying VSCode installation files

### File Structure
- Source files in `src/` directory
- Managers in `src/manager/` for file patching logic
- Generated meta in `src/generated/meta.ts` (auto-generated, do not edit manually)
- Use base classes for shared logic (see `BaseFileManager`)
- Keep utility functions in `src/utils.ts`
- Configuration handling in `src/config.ts`

### Comments
- Use JSDoc comments for public APIs and complex functions
- Keep comments concise and meaningful
- No unnecessary comments for self-explanatory code

### Project Specifics
- This is a VSCode extension that modifies VSCode's source files
- All modifications create backups with `.custom-ui-style` suffix
- Uses `reactive-vscode` framework for extension lifecycle
- Files are modified atomically using `atomically` package
- Always run typecheck before committing changes

### Important Notes
- Extension requires write access to VSCode installation directory
- Changes may require full VSCode restart (not just window reload)
- Be careful with file operations - they directly affect VSCode installation
- Test thoroughly before publishing as changes affect user's VSCode environment
