# CV Generator Development Guide

## Build Commands
- Build: `pnpm build` (TypeScript compiler)
- Test all: `pnpm test` (Jest)
- Test single: `pnpm test -- -t "test pattern"` (matching test name)
- Start generator: `pnpm start -- --sector=federal|state|private`
- Analyze job: `pnpm analyze-job`
- Import profile: `pnpm import-cv`

## Unified CLI Tool
- Primary command: `pnpm cv -- [command] [options]`
- Commands:
  - `analyze <url>` - Analyze a job posting for key requirements
  - `generate <sector>` - Generate a CV for a specific sector
  - `import <file>` - Import a markdown CV into the profile system
  - `apply <url>` - Run the complete job application workflow
- Examples:
  - `pnpm cv -- analyze https://example.com/job/12345`
  - `pnpm cv -- generate state --format pdf`
  - `pnpm cv -- apply https://example.com/job/12345 --sector federal`

## Code Style
- **Imports**: 1) Node.js modules 2) Third-party packages 3) Local imports
- **Naming**: camelCase for functions/variables, PascalCase for types/interfaces, kebab-case for files
- **Types**: Use explicit interfaces, avoid `any`, document with JSDoc
- **Error handling**: Try/catch for async, propagate with context, log before throwing
- **File organization**: Group by feature in src/{templates,services,utils,types}
- **Formatting**: Use consistent spacing, 2-space indentation, semicolons

## Testing
Tests use Jest and are located in `src/__tests__/` and `src/*/tests/`.