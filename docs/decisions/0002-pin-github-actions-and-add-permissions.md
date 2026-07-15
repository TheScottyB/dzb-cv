# ADR-0002: Pin GitHub Actions to commit SHAs and declare least-privilege permissions

- **Status:** Accepted
- **Date:** 2026-02-19
- **Deciders:** Project owner
- **Related:** Findings #6, #7, #8 in `docs/audit/2026-02-19-security-review.md`

## Context

The CI/CD audit surfaced three issues in `.github/workflows/`:

1. `browser-actions/setup-chrome@latest` — pinned to a moving tag, so a
   malicious tag update would silently execute on every run.
2. No explicit `permissions:` blocks on jobs — every job ran with the
   default broad token scope.
3. `commit-lint.yml` interpolated `${{ github.event.pull_request.*.sha }}`
   into a shell command unquoted.

Floating tags are the most common GitHub Actions supply-chain attack vector.
A compromised maintainer or hijacked release pipeline can re-point a tag to
malicious code; SHAs are immutable.

## Decision

We will:

1. **Pin every GitHub Action to a 40-char commit SHA** with the version as a
   trailing comment so dependabot/renovate can still see the intended version.
2. **Declare `permissions:` on every job**, defaulting to
   `permissions: { contents: read }` and granting writes only where required
   (the `version-pr` job needs `contents: write` and `pull-requests: write`).
3. **Quote shell-substituted GitHub context values** in `run:` blocks.

## Alternatives Considered

- **Pin to major tags (`@v4`):** Better than `@latest`, but a malicious patch
  release would still propagate. Rejected.
- **Pin to minor.patch tags (`@v4.2.2`):** Improves intent visibility but
  remains mutable — tags can be force-pushed. Rejected as the primary
  pinning strategy; acceptable as a fallback comment.
- **Use a third-party action like `step-security/harden-runner`:** Adds
  another dependency to trust. Worth evaluating later but not required now.
- **Top-level workflow `permissions:` instead of per-job:** Easier to write
  but loses per-job least-privilege. Rejected.

## Consequences

### Positive

- Immutable build provenance: the exact action code that ran is recoverable
  from the SHA forever.
- Least-privilege tokens reduce blast radius of a compromised step.
- Quoted shell values close a small but real injection class.

### Negative / Tradeoffs

- Updates now require fetching new SHAs (a Renovate config can automate this).
- Slightly more verbose workflow files.

### Follow-ups

- Set up Renovate or Dependabot with `pinDigests: true` to keep SHAs current.
- Consider `step-security/harden-runner` for egress filtering once the
  workflows stabilise.
