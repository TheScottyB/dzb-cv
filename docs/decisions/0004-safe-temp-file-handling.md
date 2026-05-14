# ADR-0004: Use OS-provided unique temp directories for PDF generation

- **Status:** Accepted
- **Date:** 2026-02-19
- **Deciders:** Project owner
- **Related:** Findings #9, #10 in `docs/audit/2026-02-19-security-review.md`

## Context

Two PDF code paths write temp files at predictable locations:

- `packages/pdf/src/simple-chrome-pdf.ts` writes to a hardcoded
  `/tmp/dzb-cv-temp.html`. Two concurrent processes overwrite each other,
  and any local user can read or replace the file between write and read.
- `packages/pdf/src/core/chrome-engine.ts` defaults to `/tmp/dzb-cv-pdf`
  with files named `temp-${Date.now()}.html`. The `Date.now()` suffix
  collides easily under burst load and is trivially predictable.

Neither path cleans up after itself.

## Decision

Both engines will use `fs.mkdtempSync(path.join(os.tmpdir(), 'dzb-cv-'))`
to create a per-invocation temp directory with a random suffix supplied
by the OS. Files are written inside that directory and the directory is
removed in a `finally` block.

## Alternatives Considered

- **`tmp` / `tmp-promise` npm package:** A reasonable choice, but adds a
  dependency for what `node:fs` already does in one line.
- **Use `crypto.randomUUID()` for the filename only:** Solves uniqueness
  but not cleanup, and still litters `/tmp`.
- **Keep files for debugging:** Useful occasionally; gated behind the
  existing `options.debug` flag instead of the default behaviour.

## Consequences

### Positive

- No collisions between concurrent runs.
- No leftover files in `/tmp`.
- Race conditions on the temp file are eliminated — `mkdtemp` creates the
  directory atomically with mode 0700.

### Negative / Tradeoffs

- Slightly more code per call site (cleanup in `finally`).
- Debug retention requires opt-in via `options.debug`.

### Follow-ups

- Audit the rest of `packages/pdf` and `agents/` for other hardcoded
  `/tmp` paths (none found in the security review, but worth a sweep).
