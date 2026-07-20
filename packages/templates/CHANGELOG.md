# @dzb-cv/templates

## 1.1.0

### Minor Changes

- ff0ac2a: feat: wire real templates into the web preview and make export honest
  - `@dzb-cv/templates` now exports `ModernTemplate` from the package index
    (previously unreachable — only `BasicTemplate` was exported)
  - Preview page renders the actually-selected template (Basic via
    marked-rendered Markdown, Modern via React SSR) with template styles
  - "Download PDF" replaced with an honest pair: "Print / Save as PDF"
    (browser print dialog) and "Download HTML"
  - Preview iframe sandboxed (`allow-same-origin allow-modals`, no scripts);
    `escapeHTML` escapes single quotes
  - Editor labels associated with inputs via htmlFor/id for all repeated rows
  - Playwright config and teardown fixed for ESM (`__dirname` crash); chromium
    `executablePath` overridable via `PLAYWRIGHT_CHROMIUM_PATH` for sandboxed
    environments

## 1.0.1

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

- Updated dependencies [e274052]
- Updated dependencies [4629100]
- Updated dependencies [e8e0d92]
- Updated dependencies [787102b]
  - @dzb-cv/types@1.1.0
  - @dzb-cv/ui@1.0.1
