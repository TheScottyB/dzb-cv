---
"@dzb-cv/types": minor
"@dzb-cv/web": minor
"@dzb-cv/cli": patch
"@dzb-cv/pdf": patch
"@dzb-cv/ai-curation": patch
"dzb-cv": minor
---

feat: unified type system, CV editor web app, and phase 1 security hardening

- Consolidated duplicate type definitions into `@dzb-cv/types` with
  `normalizeCVData()` alias resolution and shared test fixtures
- New `@dzb-cv/web` package: Vite + React CV editor (home, templates,
  editor, preview) aligned with the Playwright e2e suite
- Security: SHA-pinned GitHub Actions with least-privilege permissions,
  CLI output path validation (`safePath`), race-free temp file handling
  in PDF engines, commitlint workflow injection fix
- ADR + audit documentation workflow established under `docs/decisions/`
  and `docs/audit/`
