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
  - `scrape <url>` - Scrape a job posting using headless browser
  - `analyze <url|file>` - Analyze a job posting for key requirements
  - `generate <sector>` - Generate a CV for a specific sector
  - `import <file>` - Import a markdown CV into the profile system
  - `site-cv <site>` - Generate a CV optimized for a specific job site
  - `apply <url|file>` - Run the complete job application workflow
- Examples:
  - `pnpm cv -- scrape https://indeed.com/job/12345 --no-headless` (opens browser window)
  - `pnpm cv -- scrape https://linkedin.com/jobs/view/12345 --analyze` (scrape and analyze)
  - `pnpm cv -- analyze https://example.com/job/12345`
  - `pnpm cv -- analyze path/to/job.txt --file` (analyze local file)
  - `pnpm cv -- generate state --format pdf`
  - `pnpm cv -- site-cv indeed --ats-friendly`
  - `pnpm cv -- site-cv linkedin --include-all`
  - `pnpm cv -- apply https://example.com/job/12345 --sector federal`
  - `pnpm cv -- apply path/to/job.txt --file --sector private` (apply using local file)

## Code Style
- **Imports**: 1) Node.js modules 2) Third-party packages 3) Local imports
- **Naming**: camelCase for functions/variables, PascalCase for types/interfaces, kebab-case for files
- **Types**: Use explicit interfaces, avoid `any`, document with JSDoc
- **Error handling**: Try/catch for async, propagate with context, log before throwing
- **File organization**: Group by feature in src/{templates,services,utils,types}
- **Formatting**: Use consistent spacing, 2-space indentation, semicolons

## Testing
Tests use Jest and are located in `src/__tests__/` and `src/*/tests/`.