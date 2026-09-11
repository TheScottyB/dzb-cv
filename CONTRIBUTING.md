# Contributing

This is a pnpm + Turborepo TypeScript monorepo. Packages live in `packages/`, one-off
Node scripts in `scripts/`, and documentation in `docs/`.

## Requirements

- Node.js >= 20.10.0
- pnpm >= 10.9.0 (the repo pins `pnpm@10.9.0` via `packageManager`)

## Install and build

```bash
pnpm install
pnpm build          # turbo run build across all packages
```

`pnpm run setup` runs `scripts/setup-dzb-cv.sh` for a guided first-time setup.
`pnpm run setup:quick` is the shorthand: install + build.

## Test, lint, typecheck

```bash
pnpm test            # vitest run
pnpm run test:watch
pnpm run test:coverage
pnpm run test:e2e    # playwright, config/playwright.config.ts

pnpm lint            # turbo run lint
pnpm run lint:fix
pnpm typecheck       # turbo run typecheck
```

Vitest is configured in `vitest.config.ts` with setup in `vitest-setup.ts`.
Playwright specs live in `e2e/`. Testing notes for the core package are in
`TESTING.md` (a symlink to `packages/core/TESTING.md`).

## Commit messages

Commits follow Conventional Commits. `.github/workflows/commit-lint.yml` runs
commitlint on every pull request using `config/commitlint.config.js`, which extends
`@commitlint/config-conventional`.

Format:

```
<type>(<optional scope>): <subject>
```

Allowed types: `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`,
`revert`, `style`, `test`, `wip`.

Rules that will fail a PR:

- Header no longer than 100 characters
- Type lower-case and non-empty
- Subject non-empty, no trailing period, and not sentence-case, start-case,
  pascal-case or upper-case
- Body and footer lines no longer than 100 characters

Example: `fix(pdf): keep single-page output under one page`

## Changesets

Version bumps and changelogs are managed with Changesets
(`.changeset/config.json`). When a change affects a published package, add a
changeset in the same PR:

```bash
pnpm changeset
```

On push to `main`, `.github/workflows/version-pr.yml` uses the Changesets action to
open a "chore(release): version packages" PR, running `pnpm run version`
(`changeset version` + install) and `pnpm run release` (`changeset publish`).
Per-package changelogs are written to each package's own `CHANGELOG.md`; do not
maintain a hand-written repo-wide changelog.

## CI

`.github/workflows/ci.yml` runs on pushes to `main`/`develop` and on pull requests
to `main`. See `docs/ci-cd-integration.md` for a job-by-job description.

## Documentation

Docs live under `docs/`; `docs/README.md` is the index. Keep documented commands and
paths in sync with `package.json` and the actual contents of `scripts/` and
`packages/`.
