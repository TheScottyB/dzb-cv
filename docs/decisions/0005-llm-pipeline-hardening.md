# ADR-0005: Harden the LLM pipeline — injection defense, PII minimization, consent

- **Status:** Accepted
- **Date:** 2026-02-20
- **Deciders:** Project owner
- **Related:** Findings #1, #2, #3 in `docs/audit/2026-02-19-security-review.md`

## Context

The three critical findings of the security review all live in the LLM
pipeline (`src/core/services/llm/OpenAIClient.*`, `src/shared/tools/ai-generator.ts`):

1. Raw CV field values were interpolated directly into prompts — a CV
   containing instruction-like text could steer the model (prompt injection).
2. Email, phone, and full CV content were sent to OpenAI with no consent
   step and no data-handling notice (GDPR/CCPA exposure).
3. Externally sourced job descriptions entered the pipeline unvalidated —
   no type check, no size cap, no sanitization.

A complication discovered during implementation: the repo commits compiled
`.js` twins next to the `.ts` sources, and the `scripts/ai:*` entry points
execute the `.js` chain. Fixes therefore had to land in both.

## Decision

Add `src/core/services/llm/prompt-safety.{ts,js}` as the single safety
module for the pipeline:

1. **Injection defense.** Every untrusted value passes through
   `sanitizeForPrompt()` (strips C0/C1 controls, zero-width and bidi
   override characters, neutralizes reserved delimiter tags, caps length)
   and is wrapped in explicit data boundaries via `wrapUserData()`
   (`<cv_data>`, `<cv_content>`, `<job_description>`). System prompts and
   user prompts both carry `DATA_BOUNDARY_NOTICE` instructing the model to
   treat delimited content strictly as data.
2. **PII minimization.** `cvDataToText()` never sends contact details:
   email and phone become `[EMAIL ON FILE]` / `[PHONE ON FILE]`
   placeholders. Distillation never rewrites contact info, so nothing is
   lost — real values are re-applied by local rendering.
3. **Consent gating.** Calls to OpenAI require `DZB_CV_AI_CONSENT=granted`
   (or `true`/`yes`/`1`). Without it the pipeline uses the existing local
   fallback and prints a one-time notice describing exactly what would be
   transmitted. Safe by default: no data leaves the machine unless the
   user has opted in.
4. **Input validation.** `validateJobDescription()` enforces string type,
   a 50 KB cap, and sanitization before job text enters curation
   (`ai-generator.ts`).

## Alternatives Considered

- **Structured JSON payloads instead of delimited text:** stronger in
  principle, but requires reworking every prompt template and the model's
  output contract. Delimiters + sanitization achieve the containment with
  a fraction of the change surface. Revisit if prompts are redesigned.
- **An allowlist/regex firewall on CV text ("no imperative sentences"):**
  brittle, high false-positive rate on legitimate CV content ("Managed a
  team", "Directed operations").
- **Interactive consent prompt in the CLI:** better UX, but the pipeline
  also runs non-interactively (scripts, CI). An environment variable works
  everywhere; a CLI flag can layer on top later.
- **Redacting the candidate's name as well:** the distilled output must
  contain the name, and round-trip re-substitution is error-prone. Name
  stays; contact channels (higher-risk PII) do not.

## Consequences

### Positive

- Prompt injection via CV fields or job descriptions is neutralized at
  every entry point, with defense in depth (sanitize + delimit + notice).
- Email/phone never leave the machine at all.
- External transmission is opt-in with a clear notice — safe default.

### Negative / Tradeoffs

- Users must set `DZB_CV_AI_CONSENT=granted` once; until then AI features
  silently degrade to the local fallback (with a warning).
- Delimiter stripping mutates CVs that legitimately contain strings like
  `<cv_data>` (vanishingly rare).
- The committed `.js` twins must be kept in sync by hand until the `src/`
  tree gets a real build step (follow-up below).

### Follow-ups

- Give `src/` a proper build step so compiled twins stop drifting.
- Add a `--consent` CLI flag that sets the env var for one run.
- Apply `validateJobDescription` in `analyze-job.ts` URL-fetch path when
  SSRF finding #11 is addressed.
