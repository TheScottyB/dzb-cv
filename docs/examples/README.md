---
path: docs/examples/README.md
type: index
category: examples
maintainer: system
last_updated: 2025-05-10
related_files:
  - docs/examples/ats-optimized-cv.md
  - docs/examples/federal-cv.md
  - docs/examples/profile-management.md
---

# DZB-CV Examples

This directory contains practical examples demonstrating various features and use cases of the DZB-CV system. Use these as references for best practices, template structure, and CLI usage.

## Table of Contents
- [ATS Optimized CV Example](ats-optimized-cv.md)
- [Federal CV Example](federal-cv.md)
- [Profile Management Example](profile-management.md)

## Example Categories

### ATS Optimization
- [ATS Optimized CV Example](ats-optimized-cv.md): Example of an ATS-friendly CV with best practices and code snippets.

### Federal CV
- [Federal CV Example](federal-cv.md): Example of a federal-style CV with required fields and formatting.

### Profile Management
- [Profile Management Example](profile-management.md): Example of profile import/export, validation, and version management.

## How to Use Examples
- Choose the relevant example for your use case (ATS, federal, management)
- Copy code snippets or templates as a starting point
- Adapt to your data and requirements
- Use the CLI commands as shown for import/export/validation

## Testing Examples
- All example tests should use the shared `test-utils.ts` for DRY sample data and helpers
- ESM-compatible mocking (`vi.mock` with `importActual`) should be used for robust, future-proof tests
- See the main repo `README.md` and `TESTING.md` for code examples and best practices

## Contributing Examples
To add new examples:
1. Place your example file in this folder
2. Include complete metadata header
3. Provide clear, tested code samples
4. Add comprehensive documentation
5. Update this README with a summary and link to your example

See [Contributing Guidelines](../../CONTRIBUTING.md) for detailed contribution instructions. 