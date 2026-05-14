# ADR-0001: Use ADRs for architectural decisions

- **Status:** Accepted
- **Date:** 2026-02-19
- **Deciders:** Project owner
- **Related:** `docs/audit/2026-02-19-security-review.md`

## Context

The repo has a strong commit history but no record of *why* changes were made.
Recent multi-agent work (type unification, web app build, security review)
generated decisions that exist only in chat transcripts and PR descriptions —
which rot quickly and aren't searchable from the code.

`docs/audit/` already captures point-in-time snapshots (e.g. dependency audits).
That pattern works. We need the same for architectural decisions.

## Decision

We will keep an append-only log of architectural decisions in
`docs/decisions/`, one numbered Markdown file per decision, following the
template at `docs/decisions/template.md`.

- ADRs are immutable once Accepted. Replacing a decision means writing a
  new ADR that supersedes the previous one.
- Each ADR captures *context*, *decision*, *alternatives considered*, and
  *consequences*.
- Code commits that implement a decision reference the ADR in the body
  (e.g. `Decision: docs/decisions/0003-path-validation.md`).
- Agents (Claude Code, security review, etc.) write ADRs when their work
  produces architecturally significant outcomes.

## Alternatives Considered

- **GitHub Discussions / Issues:** Lives outside the repo, harder to grep,
  vanishes if we change hosts.
- **Wiki:** Same problem — divergent from code, no version-controlled history
  paired with the code that implements the decision.
- **Free-form `docs/`:** Already exists; no convention means it isn't searched.

## Consequences

### Positive

- Decisions are versioned with the code they describe.
- New contributors (and agents) can read the *why* before changing things.
- Pairs cleanly with the existing `docs/audit/` pattern: audits report state,
  ADRs record decisions in response.

### Negative / Tradeoffs

- Small overhead: each architecturally significant change needs a short ADR.
- Discipline required: easy to skip when shipping fast.

### Follow-ups

- When Linear is set up, link ADRs from issues via the `Decision:` convention.
- Consider a CI check that flags PRs touching `packages/*/src/` without
  either an ADR reference or a `no-adr-needed` label.
