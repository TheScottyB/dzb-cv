# Branch Cleanup — 2026-02-19

All work consolidated onto `main` (fast-forward of
`claude/unify-dataset-alignment-Cip99`, released as v1.2.0).
The following remote branches were deleted. Tip SHAs are recorded here
so the commits remain recoverable while unreachable objects persist on
the host, and so the history of what existed is not lost.

| Branch | Tip SHA | Last commit | Unique commits vs main | Notes |
|--------|---------|-------------|------------------------|-------|
| `backup-main` | `3dc8440ade77cd3173f37c3518003ac61b60cc0a` | 2025-04-23 | 11 | Pre-restructure backup of old main lineage (markdown profile parser, job-posting analysis work) |
| `changeset-release/main` | `63d217fc073e4cb48a481356ffd24a6e665cf96e` | 2025-08-02 | 1 | Stale automated changesets release branch; recreated by CI as needed |
| `codex/clean-up-folder` | `92e18fa9a5cbaee41da8c4f6b84a550541f10beb` | 2025-12-20 | 162 | Abandoned parallel refactor experiment (PDF/HTML generation overhaul) |
| `codex/tidy-up-and-rewrite-code` | `f30b20061ec771c1e30ea5a941f9a6ee582828e7` | 2026-02-18 | 1 | Single commit rewriting EKG CV draft language; superseded |
| `claude/unify-dataset-alignment-Cip99` | `787102b` (merged) | 2026-02-19 | 0 | Feature branch fully merged into main |

To recover any of these while objects persist:
`git fetch origin <sha> && git branch restore/<name> <sha>`
