# Security Review — 2026-02-19

**Reviewer:** Claude Code (`/security-review`)
**Branch:** `claude/unify-dataset-alignment-Cip99`
**Scope:** Full codebase
**Status:** 11 of 17 findings resolved — Phase 1 (#4, #6-#10), web pass
(#14, #16), Phase 2 LLM hardening (#1-#3, ADR-0005). Remaining: #5, #11,
#12, #13, #15, #17.

---

## Summary

17 findings across 4 severity levels. Highlights:

- **0 hardcoded secrets** found in source or git history
- **3 critical** issues in the AI/LLM pipeline (prompt injection, PII handling, unvalidated input)
- **5 high** issues in CI/CD and CLI path handling
- **5 medium** issues across temp files, SSRF, decompression
- **4 low** issues in web app HTML escaping and error messages

## Phase 1 Resolved (this cycle)

| ID  | Finding                                          | Resolution         |
|-----|--------------------------------------------------|--------------------|
| #4  | Path traversal via CLI `--output` option         | ADR-0003           |
| #6  | Unpinned GitHub Action (`@latest`)                | ADR-0002           |
| #7  | Missing job-level CI permissions                 | ADR-0002           |
| #8  | Variable injection in commitlint workflow         | ADR-0002           |
| #9  | Predictable temp file (race condition)           | ADR-0004           |
| #10 | Predictable temp directory in Chrome engine       | ADR-0004           |

## Remaining (tracked for Phase 2 / 3)

### Critical

1. ~~**Prompt injection — CV data interpolated into LLM prompts**~~ —
   resolved 2026-02-20 (ADR-0005): all fields pass `sanitizeForPrompt()`,
   prompts use `<cv_data>` boundaries + standing data-only notice
2. ~~**Personal data sent to external AI without consent**~~ — resolved
   2026-02-20 (ADR-0005): email/phone replaced with placeholders, external
   calls gated behind `DZB_CV_AI_CONSENT=granted` with privacy notice
3. ~~**Unvalidated job description input to LLM**~~ — resolved 2026-02-20
   (ADR-0005): `validateJobDescription()` enforces type, 50 KB cap,
   sanitization

### High

5. **Chrome spawn with user-controlled output path**
   - `packages/pdf/src/core/chrome-engine.ts:94-136`

### Medium

11. **Missing SSRF protection on URL fetches**
    - `src/cli/commands/analyze-job.ts:433-443`
12. **Insecure decompression (no size limit)**
    - `agents/IndeedLinkProcessorAgent.ts:122-156`
13. **Weak Content-Type validation**
    - `packages/job-analyzer/src/content-fetcher.ts:61-69`

### Low

14. ~~**Incomplete HTML escape (missing single quote)**~~ — resolved 2026-02-19:
    `escapeHTML` now escapes `'`; template rendering delegated to
    `@dzb-cv/templates` (`PreviewPage.tsx`)
15. **Missing CSP headers** — `packages/web/index.html`
16. ~~**iframe without `sandbox` attribute**~~ — resolved 2026-02-19: preview
    iframe now uses `sandbox="allow-same-origin allow-modals"` (no scripts)
17. **Error messages may leak system info**
    - `src/ats/agents/LLMServiceAgent.ts:92-93`
    - `src/core/services/llm/OpenAIClient.ts:133`

## Positive Findings

| Area                                | Status   |
|-------------------------------------|----------|
| Hardcoded secrets / API keys         | None found |
| `.env` excluded from git             | Configured |
| CI secret-scanning step              | Active     |
| `pnpm-lock.yaml` integrity           | SHA512 hashes present |
| `--frozen-lockfile` in CI            | Used       |
| `eval()` / `dangerouslySetInnerHTML` | Not used   |
| Vulnerable dep overrides             | Configured |
| Suspicious postinstall scripts       | None       |
