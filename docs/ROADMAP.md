# dzb-cv Improvement Roadmap

**Date:** April 25, 2025  
**Version:** 1.0.0  
**Status:** Proposed

## Introduction

This roadmap outlines a comprehensive plan to improve the dzb-cv project - a modular CV management system with job analysis capabilities. The plan is structured into nine focused phases, each addressing specific areas for enhancement. Each phase contains concrete, test-driven deliverables that can be tackled in parallel or sequentially by team members or AI agents.

For every task, contributors should produce a PR with accompanying tests, documentation, and an entry in the CHANGELOG following Conventional Commits standards.

## Roadmap Phases

### Phase 0 – Project Setup & Governance
1. Create a high-level roadmap (this file) at `docs/ROADMAP.md`
2. Add/confirm a CODEOWNERS file so agents know reviewers
3. Enforce Conventional Commits with a commit-lint GitHub Action

### Phase 1 – Repository Audit
1. Generate an inventory report (`scripts/audit.ts`) covering:
   - Test coverage gaps  
   - Empty docs / architecture files  
   - Duplicate/unused code & types  
   - Dependency list and versions  
   - Current CLI command matrix  
2. Save the report as `docs/audit/YY-MM-DD.md`

### Phase 2 – Testing Coverage & Quality
1. Establish Vitest config with 90% lines/branches threshold (editable in `vitest.config.ts`)
2. Unit Tests  
   - Core services: PDF, ATS analyser, profile manager, import/export, job analyser  
   - Use table-driven cases; mock I/O with `mock-fs`
3. Integration Tests  
   - Exercise each CLI command via `execa`  
   - Snapshot expected stdout/stderr and generated files  
4. Add coverage badge and CI gate (`npm run test:ci`)

### Phase 3 – Documentation
1. Architecture  
   - Fill `docs/architecture/` with C4 diagrams (use `drawio-export`)  
   - Describe data flow for template rendering and agent system
2. API Docs  
   - Generate with TypeDoc; publish to GitHub Pages via Action
3. Agent System Guide  
   - Detail agent types, memory stores, event bus  
   - Provide usage examples in `examples/agents`

### Phase 4 – Code Organization & Refactor
1. Consolidate Types  
   - Merge `src/core/types` + `src/shared/types` into `src/types`  
   - Export barrel file `src/types/index.ts`
2. PDF Service Unification  
   - Pick primary library (`pdf-lib` recommended)  
   - Create `PdfGenerator` interface + adapters; remove duplicates
3. Tool Consolidation  
   - Move fragmented helpers into `src/tools/` with index
4. Update imports project-wide via codemod

### Phase 5 – Build, Release & CI/CD
1. Replace tsc build with `tsup` (faster, single output)  
2. Add semantic-release for automated versioning & GitHub Releases  
3. Generate changelog automatically  
4. Extend CI pipeline: lint → test → build → release → docs deploy

### Phase 6 – Standardised Error Handling
1. Create `src/errors/` with base `AppError`, domain-specific subclasses, and `Result<T,E>` util
2. Refactor services & CLI to throw/return typed errors only
3. Global CLI handler prints friendly messages & feedback codes

### Phase 7 – Dependency Consolidation & Security
1. Decide on single PDF and Markdown libraries; remove the rest  
2. Run `npm audit fix ‑-force` & manually patch remaining CVEs  
3. Add `pnpm audit` & `dependabot` config

### Phase 8 – Agent System Completion
1. Define agent interfaces (`IAgent`, `AgentContext`, `MemoryStore`)  
2. Implement coordinator orchestrating multi-agent tasks  
3. Provide in-memory and file-based memory implementations  
4. Tests: concurrency, memory eviction, message routing  
5. Docs & example scripts (`examples/agent-demo.ts`)

### Phase 9 – Modernization & Containerization
1. Target Node 20; leverage `structuredClone`, `test` runner as optional  
2. Provide `Dockerfile` (+ Multi-arch) & `docker-compose.yml` for local runs  
3. Offer pre-built container via GitHub Container Registry

## Deliverables & Milestones

- **End of Phase 2:** ≥90% test coverage, green CI  
- **End of Phase 5:** Automated release producing versioned CLI binaries  
- **End of Phase 8:** Fully documented, test-covered agent framework  
- **End of Phase 9:** Docker image published

## Contribution Guidelines

- Each PR must include tests & docs  
- Use Conventional Commit messages  
- Run `pnpm lint && pnpm test` locally before pushing

## Implementation Strategy

The roadmap is designed to progressively improve the codebase without disrupting existing functionality. Teams can work on different phases in parallel, particularly once the initial audit is complete.

With this roadmap, we can methodically elevate dzb-cv into a robust, well-documented, and production-ready CV management platform.

