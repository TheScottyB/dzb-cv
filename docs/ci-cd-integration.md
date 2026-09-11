# CI/CD

What the workflows in `.github/workflows/` actually do.

## `ci.yml` - CI/CD Pipeline

Triggers: push to `main` or `develop`, and pull requests targeting `main`.
Default permissions are `contents: read`. All actions are pinned to commit SHAs
(see `docs/decisions/0002-pin-github-actions-and-add-permissions.md`).

### `test`

Matrix over Node 20.x and 22.x. Installs pnpm 10.9.0, restores the pnpm cache, runs
`pnpm install --frozen-lockfile`, then `pnpm build`.

`pnpm lint` and `pnpm typecheck` both run with `|| true`, so lint and type errors do
not currently fail the build.

Then `npm test` inside `packages/ats`, Chrome is installed for PDF work, and
`scripts/evaluate-cv-quality.js` is run against
`examples/ekg-cv-showcase/Dawn_Zurick_Beilfuss_Single_Page_CV.md`, also with
`|| true`. The job ends with a step that only echoes status lines.

Note: the root `pnpm test` (Vitest) is not run by this job; only the ATS package's
tests are.

### `security`

No checkout dependencies beyond the repo itself. Greps the tree for `sk-` in `.ts`
and `.js` files, excluding `node_modules` and a handful of known false positives, and
fails the job if anything matches. A second grep for `password`/`secret`/`token`
prints a review reminder but does not fail.

### `quality`

Needs `test`. Installs, builds, installs Chrome, then runs
`scripts/evaluate-cv-quality.js` on
`examples/ekg-cv-showcase/Dawn_Zurick_Beilfuss_Single_Page_CV.md`, parsing the
"Overall Score" out of the output. The job fails if the score is below 70. The
exported `quality-results.json` is uploaded as the `quality-results` artifact,
`if: always()`.

### `documentation`

Checks out the repo and asserts that `README.md`, `CONTRIBUTING.md`, `LICENSE` and
`USAGE.md` all exist and that an `examples` directory exists. Missing any one of them
fails the job. It does not check documentation content.

### `performance`

Needs `test`. Installs, builds, installs Chrome, then times
`npm test` in `packages/ats` with a 10-second timeout. A run slower than 10 seconds
prints a warning but does not fail the job.

### `release`

Needs all of `test`, `security`, `quality`, `documentation`, `performance`, and runs
only on pushes to `main`. It writes a summary to `$GITHUB_STEP_SUMMARY`. It does not
publish anything.

## `commit-lint.yml` - Lint Commit Messages

Runs on pull requests to `main`, `master` or `develop`. Checks out with full history,
installs dependencies, and runs
`npx commitlint --config config/commitlint.config.js` over the range between the PR
base and head SHAs. See `CONTRIBUTING.md` for the accepted commit format.

## `version-pr.yml` - Version & Release PR

Runs on pushes to `main` and on manual dispatch. Uses the Changesets action to open
or update a `chore(release): version packages` pull request, running
`pnpm run version` (`changeset version` plus install) and, on merge,
`pnpm run release` (`changeset publish`). Caches `.turbo`.

## Running the same checks locally

```bash
pnpm install
pnpm build
pnpm lint
pnpm typecheck
pnpm test
cd packages/ats && npm test
node scripts/evaluate-cv-quality.js examples/ekg-cv-showcase/Dawn_Zurick_Beilfuss_Single_Page_CV.md
```
