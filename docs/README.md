---
path: docs/README.md
type: index
category: documentation
maintainer: system
last_updated: 2026-09-11
related_files:
  - docs/technical/README.md
  - docs/reference/Reference.md
---

# DZB-CV Documentation

Index of everything under `docs/`. Start with `USAGE.md` at the repo root for the
day-to-day workflow and `CONTRIBUTING.md` for development.

## Guides

- [EKG Technician CV Generation](EKG_TECHNICIAN_CV_GENERATION.md) - the EKG and
  Medical Assistant generation flow, end to end
- [Application & Cover Letter Customization Process](Application-Customization-Process.md) -
  reverse engineering and tailoring application materials
- [AI Content Curation Integration](ai-curation-integration.md) - how
  `packages/ai-curation` fits into one-page CV generation
- [CI/CD](ci-cd-integration.md) - what the GitHub Actions workflows actually do

## User guide

`user-guide/`

- [Index](user-guide/README.md)
- [Getting Started](user-guide/getting-started.md)
- [Advanced Usage](user-guide/advanced-usage.md)
- [Troubleshooting](user-guide/troubleshooting.md)

## Reference

`reference/`

- [Reference](reference/Reference.md) - consolidated CLI, API and configuration
  reference
- [CLI Reference](reference/CLI-REFERENCE.md) - the `cv` binary and the pnpm scripts

## Examples

- [Examples](examples/README.md) - worked generation examples; the rendered artefacts
  live in `examples/` at the repo root

## Technical

`technical/` - see the [Technical Documentation Index](technical/README.md)

- [Components](technical/COMPONENTS.md)
- [ATS](technical/ats/README.md) - plus
  [Architecture](technical/ats/ARCHITECTURE.md) and
  [API Reference](technical/ats/API-REFERENCE.md)
- [PDF Generation](technical/pdf-generation/README.md)
- [Profile Management](technical/profile-management/README.md)
- [Job Analysis](technical/job-analysis/README.md)
- [Developer Experience](technical/developer-experience/README.md)
- [Standards](technical/standards/README.md) - naming conventions and documentation
  metadata
- [Agent Architecture](technical/agent-architecture/README.md) - removed from the
  codebase; kept as a pointer to the archived design

## Testing

- [Testing](testing/README.md). Core-package testing notes are in `TESTING.md` at the
  repo root (a symlink to `packages/core/TESTING.md`).

## Decisions

`decisions/` - architecture decision records, ADR-0001 through ADR-0006, plus
[template.md](decisions/template.md).

## Audits and session reports

- `audit/` - point-in-time repository audits
- `session-reports/` - working notes from individual sessions

## Archive

`archive/` - superseded material kept for reference, not maintained:

- `archive/docs-2025/` - retired documentation (project history and roadmap, the
  agent blueprint, AI distillation improvement notes)
- `archive/applications-2025/` - past job applications
- `archive/sample-healthcare-application-2025/` - the former sample application

## Other

- `index.html` - the published documentation landing page

## Maintenance

Keep documented commands and paths in sync with `package.json`, `scripts/` and
`packages/`. `docs/technical/standards/documentation-metadata.md` describes the YAML
front-matter convention used by files under `docs/technical/`.
