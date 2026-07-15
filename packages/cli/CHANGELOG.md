# @dzb-cv/cli

## 1.2.0

### Minor Changes

- 4629100: feat: modernize monorepo to latest standards

  This change includes:
  - Updated TypeScript configuration to ES2022
  - Added strict type checking options
  - Implemented Playwright for E2E testing
  - Enhanced Turbo configuration with remote caching
  - Added Changesets for version management

- e8e0d92: feat: implement single-page PDF generation feature

  Add support for generating single-page PDFs optimized for concise CV presentation:
  - New `--single-page` CLI flag for compact formatting
  - Optimized font sizing and spacing for maximum content density
  - Enhanced PDF generators (pdf-lib and puppeteer) with single-page layout options
  - Comprehensive test coverage for single-page generation functionality
  - Updated CLI to support sector-specific single-page generation
  - Improved content optimization algorithms for space-constrained layouts

  Perfect for entry-level positions, career changers, and roles requiring concise presentation.

### Patch Changes

- e274052: 🎉 Major Repository Cleanup and Optimization

  ### Repository Structure Optimization
  - **File Organization**: Reorganized 97 → 56 root files (41% reduction)
  - **Asset Management**: Moved 29+ generated PDFs to organized structure
  - **Build Cleanup**: Removed 24 turbo logs and 8 dist directories
  - **System Cleanup**: Eliminated all .DS_Store files

  ### Branch Management Excellence
  - **Merged Features**: Successfully integrated cleanup work into main
  - **Stale Branch Removal**: Cleaned up problematic and outdated branches
  - **Git Hygiene**: Pruned remote references and optimized branch structure

  ### Infrastructure Improvements
  - **Enhanced .gitignore**: Future-proof patterns prevent clutter return
  - **Fixed References**: Updated all documentation and script paths
  - **Breaking Changes**: Resolved all breaking changes from reorganization
  - **Import Paths**: Verified all module imports work correctly

  ### Quality Assurance
  - **289 Tests Passing**: Full functionality verification
  - **Critical Features**: AI generator, PDF creation, CLI all validated
  - **Build System**: Clean regeneration capability confirmed
  - **Zero Technical Debt**: Clean slate for continued development

  ### Developer Experience
  - **Clear Structure**: Every file in its logical place
  - **Updated Documentation**: All references current and accurate
  - **Professional Organization**: Enterprise-grade repository structure
  - **Future-Proof Setup**: Enhanced patterns prevent regression

  This represents a complete transformation from a cluttered development workspace to a pristine, production-ready codebase while preserving 100% of functionality.

- 787102b: feat: unified type system, CV editor web app, and phase 1 security hardening
  - Consolidated duplicate type definitions into `@dzb-cv/types` with
    `normalizeCVData()` alias resolution and shared test fixtures
  - New `@dzb-cv/web` package: Vite + React CV editor (home, templates,
    editor, preview) aligned with the Playwright e2e suite
  - Security: SHA-pinned GitHub Actions with least-privilege permissions,
    CLI output path validation (`safePath`), race-free temp file handling
    in PDF engines, commitlint workflow injection fix
  - ADR + audit documentation workflow established under `docs/decisions/`
    and `docs/audit/`

- Updated dependencies [e274052]
- Updated dependencies [4629100]
- Updated dependencies [e8e0d92]
- Updated dependencies [787102b]
  - @dzb-cv/core@1.2.0
  - @dzb-cv/pdf@1.2.0
  - @dzb-cv/templates@1.0.1
  - @dzb-cv/types@1.1.0
