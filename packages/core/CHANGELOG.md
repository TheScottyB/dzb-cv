# @dzb-cv/core

## 1.2.0

### Minor Changes

- [#2](https://github.com/TheScottyB/dzb-cv/pull/2) [`4629100`](https://github.com/TheScottyB/dzb-cv/commit/462910041474e32bcfd8723c1efb6ad006023b5f) Thanks [@TheScottyB](https://github.com/TheScottyB)! - feat: modernize monorepo to latest standards

  This change includes:
  - Updated TypeScript configuration to ES2022
  - Added strict type checking options
  - Implemented Playwright for E2E testing
  - Enhanced Turbo configuration with remote caching
  - Added Changesets for version management

- [`e8e0d92`](https://github.com/TheScottyB/dzb-cv/commit/e8e0d92fc5fcefe899e2f6f25199fb7ee8d843d0) Thanks [@TheScottyB](https://github.com/TheScottyB)! - feat: implement single-page PDF generation feature

  Add support for generating single-page PDFs optimized for concise CV presentation:
  - New `--single-page` CLI flag for compact formatting
  - Optimized font sizing and spacing for maximum content density
  - Enhanced PDF generators (pdf-lib and puppeteer) with single-page layout options
  - Comprehensive test coverage for single-page generation functionality
  - Updated CLI to support sector-specific single-page generation
  - Improved content optimization algorithms for space-constrained layouts

  Perfect for entry-level positions, career changers, and roles requiring concise presentation.

### Patch Changes

- Updated dependencies [[`4629100`](https://github.com/TheScottyB/dzb-cv/commit/462910041474e32bcfd8723c1efb6ad006023b5f), [`e8e0d92`](https://github.com/TheScottyB/dzb-cv/commit/e8e0d92fc5fcefe899e2f6f25199fb7ee8d843d0)]:
  - @dzb-cv/types@1.0.2
