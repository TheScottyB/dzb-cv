# @dzb-cv/web

## 1.2.0

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

### Patch Changes

- e54a146: security: phase 3 hardening — output-path validation in PDF engines,
  strict content-type + redirect cap in job-analyzer, CSP in web app
  (ADR-0006; all 17 audit findings now resolved)
- Updated dependencies [ff0ac2a]
  - @dzb-cv/templates@1.1.0

## 1.1.0

### Minor Changes

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

### Patch Changes

- Updated dependencies [e274052]
- Updated dependencies [4629100]
- Updated dependencies [e8e0d92]
- Updated dependencies [787102b]
  - @dzb-cv/templates@1.0.1
  - @dzb-cv/types@1.1.0
  - @dzb-cv/ui@1.0.1
