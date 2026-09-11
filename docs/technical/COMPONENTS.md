# Components

Where the main pieces of the system live.

| Concern | Location | Notes |
| --- | --- | --- |
| Shared types | `packages/types` | Foundation layer; `packages/types/src/cv/base.ts` holds the core CV types |
| CV service | `packages/core` | CRUD, validation and export orchestration |
| PDF generation | `packages/pdf` | pdf-lib and Puppeteer engines; see `docs/technical/pdf-generation/PDF-GENERATION.md` |
| Templates | `packages/templates` | React templates (`basic`, `modern`) |
| CLI | `packages/cli` | The `cv` binary; see `docs/reference/CLI-REFERENCE.md` |
| ATS analysis | `packages/ats` | Analyzers, scoring and taxonomies; see `docs/technical/ats/README.md` |
| Job analysis | `packages/job-analyzer` | Posting parsing and matching; see `docs/technical/job-analysis/JOB-ANALYSIS.md` |
| AI curation | `packages/ai-curation` | Content analysis, ranking and curation for one-page CVs |
| Configuration | `packages/config`, `packages/configuration` | Shared build/lint config and runtime configuration |
| Errors and logging | `packages/errors`, `packages/logging` | Cross-cutting utilities |
| UI and web | `packages/ui`, `packages/web` | React components and the web surface |
| Mobile | `packages/mobile` | Client for the `scripts/serve-api.js` bridge |
| Performance | `packages/performance` | Benchmarking helpers |

Generation and quality scripts live in `scripts/`; see `docs/reference/CLI-REFERENCE.md`
for the full list and the pnpm scripts that wrap them.

## Known rough edges

- Company-name extraction from job postings is unreliable for some domains.
- Generated filenames can grow long; see
  `docs/technical/standards/NAMING-CONVENTIONS.md`.
- Fact verification against the profile is documented in
  `docs/technical/profile-management/DATA-VERIFICATION.md`.
