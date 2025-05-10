---
path: docs/technical/Developer-Experience.md
type: technical
category: dx
maintainer: system
last_updated: 2025-05-10
---

# Developer Experience & Maintenance

## Table of Contents
- [Introduction](#introduction)
- [Linting & Formatting](#linting--formatting)
- [Type-Checking](#type-checking)
- [Pre-commit/Pre-push Hooks](#pre-commitpre-push-hooks)
- [Test Feedback Loop](#test-feedback-loop)
- [Continuous Integration](#continuous-integration)
- [Editor & Developer UX](#editor--developer-ux)
- [Documentation & Automation](#documentation--automation)
- [Onboarding & Setup Checklist](#-onboarding--setup-checklist)
- [Maintenance Checklist](#-maintenance-checklist)
- [High-Leverage Improvement Summary](#high-leverage-improvement-summary)

## Introduction

This document outlines the best practices, audit findings, and maintenance checklists for ensuring a world-class developer experience (DX) in the DZB-CV monorepo. It covers linting, testing, CI, onboarding, and ongoing maintenance.

---

## Linting & Formatting
- ESLint: Strict, TypeScript-friendly config with `@typescript-eslint/recommended`.
- Prettier: Explicit config for consistent formatting.
- `.editorconfig` for universal formatting.
- `lint-staged` for staged file lint/format.
- VSCode integration for linting and formatting.

**Strengths:**
- Good TS linting discipline.
- Codebase-wide formatting rules.
- Per-file staged lint/format is possible.
- Explicit Prettier configuration with documented rules.

---

## Type-Checking
- Extremely strict `tsconfig.json` with all best-practice error-surfacing flags.
- `pnpm typecheck` (`tsc --noEmit`) available.
- VSCode configured to use workspace TypeScript.

**Strengths:**
- Errors surfaced early by TypeScript.
- Separate test tsconfig for test-specific types.
- IDE integration for immediate type feedback.

---

## Pre-commit/Pre-push Hooks
- Problems are surfaced early via editor and PR (CI problem matchers active).
- CI must pass on PR before merge (typecheck, lint, test, build).
- All packages use shared `test-utils.ts` and ESM-compatible mocking for robust, DRY, and reliable tests.

---

## Test Feedback Loop
- Vitest with coverage (`text`, `json`, `html`), watch mode via separate scripts.
- Tests excluded from main tsconfig build, isolated in tests tsconfig.
- CI runs `pnpm test` on push/PR.
- VSCode Vitest extension recommended.

**Strengths:**
- Fast TS-native testing with coverage.
- Watch script for live feedback (`pnpm test:watch`).
- IDE integration for test running and debugging.
- UI test explorer available (`pnpm test:ui`).
- All packages use a shared `test-utils.ts` for DRY, robust test data and helpers.
- ESM-compatible mocking (`vi.mock` with `importActual`) is standard for reliable, future-proof tests.

---

## Continuous Integration
- GitHub Actions: CI pipeline runs install, typecheck, test, lint, build.
- Multi-language `test.yml` for Node and Python, including coverage upload to Codecov.
- Good matrix config and caching.

**Strengths:**
- CI covers all major checks.
- Build blocked unless lint/type/test pass.

---

## Editor & Developer UX
- `.editorconfig` ensures base text settings.
- `.vscode/extensions.json` recommends ESLint, Prettier, and Vitest extensions.
- Volta pinned Node and PNPM versions.

**Strengths:**
- Consistent cross-editor base formatting.
- Comprehensive IDE tooling recommendations.
- Locked toolchain versions.

---

## Documentation & Automation
- `CONTRIBUTING.md` and `README.md` present.
- Comprehensive scripts in `package.json`.
- Volta-pinned toolchain.
- Unified test-utils and ESM mocking patterns are documented and enforced across all packages.

---

## 🚀 Onboarding & Setup Checklist
- [ ] Use Volta to manage tool versions (`node`, `pnpm`) as specified in `package.json`
- [ ] Install dependencies: `pnpm install`
- [ ] Run setup and prepare scripts:  
  - `pnpm run setup`  
  - `pnpm run prepare`
- [ ] Enable Git LFS if prompted
- [ ] Install all recommended VSCode extensions (`.vscode/extensions.json`)
- [ ] Ensure settings in `.vscode/settings.json` are respected (format on save, ESLint, Prettier)
- [ ] Use provided launch and task configs for rapid dev/test/debug

---

## 🔄 Maintenance Checklist
- [ ] Problems are surfaced early via editor and PR (CI problem matchers active)
- [ ] CI must pass on PR before merge (typecheck, lint, test, build)
- [ ] All packages use shared `test-utils.ts` and ESM-compatible mocking for robust, DRY, and reliable tests
- [ ] Use clear, semantic commit messages (`feat:`, `fix:`, `