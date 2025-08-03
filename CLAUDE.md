# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands and Scripts

### Development Workflow
```bash
# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Run tests
pnpm test
pnpm test:watch
pnpm test:coverage

# Type checking and linting
pnpm run typecheck
pnpm run lint
pnpm run lint:fix

# End-to-end testing
pnpm test:e2e
pnpm test:e2e:ui

# Clean build artifacts
pnpm run clean
```

### Setup and CLI
```bash
# Automated setup (recommended)
./scripts/setup-dzb-cv.sh

# Quick setup without global linking
pnpm run setup:quick

# Link/unlink CLI globally
pnpm run link-cli
pnpm run unlink-cli

# Use CLI (without global linking)
pnpm run cv [command]
node packages/cli/dist/index.js [command]
```

### AI Testing and Quality Assurance
```bash
# Evaluate CV quality with comprehensive metrics
pnpm run ai:quality-check

# Test AI distillation pipeline
pnpm run ai:test

# Run A/B testing for configuration optimization
pnpm run ai:ab-test

# Full AI test suite (quality check + distillation test)
pnpm run ai:full-test

# Benchmark AI performance
pnpm run ai:benchmark
```

### Single Test Execution
```bash
# Run tests for specific package
cd packages/[package-name]
pnpm test

# Run specific test file
pnpm test -- --run path/to/test.test.ts

# Run tests with coverage for specific package
cd packages/[package-name]
pnpm test -- --coverage
```

## Architecture Overview

### Monorepo Structure
This is a TypeScript monorepo using pnpm workspaces with Turbo for build orchestration. The architecture follows a layered dependency model:

```
packages/
├── types/          # Foundation layer - shared type definitions
├── core/           # Service layer - CV management and business logic
├── pdf/            # Output layer - PDF generation with multiple engines
├── templates/      # Presentation layer - CV templates and styling
├── ui/             # Component layer - React components for UI
├── cli/            # Interface layer - Command-line interface
├── ats/            # Analysis layer - ATS parsing and CV optimization
├── ai-curation/    # Intelligence layer - AI-powered content curation
└── config/         # Configuration layer - shared build and lint configs
```

### Key Architectural Patterns
- **Dependency Injection**: Services use constructor injection for testability
- **Plugin Architecture**: PDF generators, templates, and analyzers are pluggable
- **Event-Driven**: Agent communication uses message bus pattern
- **Type Safety**: Comprehensive TypeScript coverage with strict type checking

### Core Services and Components

#### CV Management (`@dzb-cv/core`)
- `CVService`: Main service for CV operations (CRUD, validation, export)
- Handles data transformation and validation
- Integrates with storage providers and PDF generators

#### PDF Generation (`@dzb-cv/pdf`)
- Multiple PDF engines: pdf-lib (lightweight) and Puppeteer (HTML-based)
- Template-driven rendering with optimized scaling parameters
- Single-page optimization (0.88 scale, 9pt minimum font size)

#### AI-Powered Features (`@dzb-cv/ats`, `@dzb-cv/ai-curation`)
- `LLMServiceAgent`: Orchestrates AI processing pipeline using GPT-4o
- `AgentMessageBus`: Handles inter-agent communication
- Advanced content distillation with quality validation
- A/B testing framework for optimization parameters

#### Template System (`@dzb-cv/templates`)
- React-based templates with CSS modules
- Basic and Modern templates available
- Extensible template architecture

### Testing Strategy
- **Unit Tests**: Vitest with ESM-compatible mocking
- **Integration Tests**: End-to-end package testing
- **AI Quality Assurance**: Automated CV quality evaluation
- **E2E Tests**: Playwright for UI workflows

### Data Flow
1. Raw CV data → Core validation → Template rendering → PDF generation
2. Job analysis → ATS optimization → AI content curation → Quality validation
3. CLI commands → Service layer → Storage/Export

### Configuration Management
- Shared ESLint config in `@dzb-cv/config`
- TypeScript project references for cross-package dependencies
- Turbo configuration for optimized builds and caching
- Vitest configuration with workspace-aware module resolution

### Environment Requirements
- Node.js >= 20.10.0
- pnpm >= 10.9.0
- TypeScript 5.9+
- ESM-only modules (no CommonJS)

### Key Files and Locations
- Main CLI entry: `packages/cli/src/index.ts`
- Core types: `packages/types/src/cv/base.ts`
- PDF generators: `packages/pdf/src/generators/`
- AI tools: `src/shared/tools/ai-generator.ts`
- Test utilities: Each package has `test-utils.ts` for shared test data
- Quality scripts: `scripts/evaluate-cv-quality.js`, `scripts/test-ai-distillation.js`

### Development Notes
- Always build packages before testing: `pnpm run build`
- Use `pnpm test:watch` for active development
- AI features require OpenAI API key (falls back to simulation mode)
- PDF generation uses optimal parameters: 0.88 scale, 240% quality improvement
- Templates use CSS modules with TypeScript definitions