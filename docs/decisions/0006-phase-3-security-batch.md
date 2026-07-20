# ADR-0006: Phase 3 security batch — network, decompression, output-path, CSP

- **Status:** Accepted
- **Date:** 2026-02-20
- **Deciders:** Project owner
- **Related:** Findings #5, #11, #12, #13, #15, #17 in
  `docs/audit/2026-02-19-security-review.md`; ADR-0003 (path validation)

## Context

Six remaining audit findings, all mechanical now that the Phase 1/2
utilities exist. Batched into one decision record because they share a
theme: constraining what external inputs (URLs, compressed blobs,
content types, output paths) can make the system do.

## Decision

1. **#5** PDF engines validate `outputPath` before handing it to Chrome —
   same containment rule as ADR-0003 (`cwd` or OS temp dir).
2. **#11** Job-posting fetches validate URLs first: http/https only;
   private/reserved IP ranges, `localhost`, `.local`, `.internal` rejected
   (SSRF guard).
3. **#12** Indeed-data decompression capped: 10 MB compressed input,
   1 MB decompressed output (`zlib maxOutputLength`).
4. **#13** Content-type checked with a strict `^text/html(;|$)` match;
   redirect limit reduced 20 → 5.
5. **#15** Web app ships a Content-Security-Policy meta tag
   (`default-src 'self'`, inline styles allowed for template rendering).
6. **#17** Error logs emit `name: message` only — no raw error objects or
   stacks in production console output.

## Alternatives Considered

- DNS-resolution-time SSRF checks (guards against DNS rebinding): heavier;
  the CLI fetches user-chosen job URLs interactively, so hostname-level
  filtering is proportionate. Revisit if fetching becomes server-side.
- CSP via server headers: better than meta tags, but there is no
  deployment server yet; the meta tag travels with the static build.

## Consequences

- All 17 findings from the 2026-02-19 review are now resolved.
- Decompression or fetch of hostile inputs fails fast with a clear error.
- Follow-up: when a deployment target exists, move CSP to real headers
  and add `frame-ancestors`.
