# CV Generator Development Guide

## Build Commands
- Build: `pnpm build` (TypeScript compiler)
- Test all: `pnpm test` (Jest)
- Test single: `pnpm test -- -t "test pattern"` (matching test name)
- Start generator: `pnpm start -- --sector=federal|state|private`
- Analyze job: `pnpm analyze-job`
- Import profile: `pnpm import-cv`

## Code Style
- **Imports**: 1) Node.js modules 2) Third-party packages 3) Local imports
- **Naming**: camelCase for functions/variables, PascalCase for types/interfaces, kebab-case for files
- **Types**: Use explicit interfaces, avoid `any`, document with JSDoc
- **Error handling**: Try/catch for async, propagate with context, log before throwing
- **File organization**: Group by feature in src/{templates,services,utils,types}
- **Formatting**: Use consistent spacing, 2-space indentation, semicolons

## Testing
Tests use Jest and are located in `src/__tests__/` and `src/*/tests/`.