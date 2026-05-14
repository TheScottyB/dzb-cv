# ADR-0003: Validate CLI output paths to prevent path traversal

- **Status:** Accepted
- **Date:** 2026-02-19
- **Deciders:** Project owner
- **Related:** Finding #4 in `docs/audit/2026-02-19-security-review.md`

## Context

`packages/cli/src/commands/create.ts` accepts an arbitrary `--output` path
from the user, then calls `fs.mkdirSync(dirname(path), { recursive: true })`
and `fs.writeFileSync(path, pdf)` against it. There is no validation that
the resolved path stays within an expected base directory.

In a CLI run by the file owner this is *technically* in their own
permissions envelope, so it is not a remote vulnerability — but:

- A future deployment that runs the CLI as a service or in CI loses that
  containment.
- Shell-completion footguns (`--output ../../etc/passwd`) become real bugs.
- The same utility is needed for several other audit findings (#5, #6 in
  the PDF engine).

## Decision

Add a small `safePath` utility in `packages/cli/src/utils/safe-path.ts`
that:

1. Resolves the user-supplied path against a base directory (default:
   `process.cwd()`).
2. Throws if the resolved path escapes the base directory.
3. Returns the absolute, normalised path.

`create.ts` will use it before any filesystem write.

## Alternatives Considered

- **Trust the user (status quo):** Local CLI, single user, low risk today.
  Rejected because the same path-handling code will move into shared
  packages and other contexts.
- **Use a 3rd-party library (`upath`, `path-is-inside`):** Extra
  dependency for a 15-line utility. Rejected.
- **Sandbox the whole CLI process:** Heavy, OS-specific, out of scope.

## Consequences

### Positive

- Makes path-handling code reviewable: every write goes through `safePath`.
- Future agents and reviewers have one place to look for this concern.
- Same utility usable in PDF and ATS packages later.

### Negative / Tradeoffs

- Users can no longer write outside the working directory by default.
  The error message is explicit so they can rerun from the right cwd.

### Follow-ups

- Reuse in `packages/pdf/src/core/chrome-engine.ts` (finding #5) once
  the engine signature is refactored.
- Optionally accept a `--allow-outside` escape hatch later if real users
  want it.
