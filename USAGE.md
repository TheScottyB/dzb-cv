# Usage

How to generate Dawn's CVs from this repo. For architecture, package internals and
reference material see `docs/` (start at `docs/README.md`).

## Setup

```bash
pnpm install
pnpm build
```

## 1. Edit the profile

`base-info.json` at the repo root is the canonical profile. `scripts/generate-cv.js`
reads it directly.

`data/base-info.json` is a synced copy used by the `packages/cli` `create` command.
Keep it in step with the root file after editing (`scripts/serve-api.js` syncs both on
`PUT /profile`).

`pnpm run update:profile` prints a reminder of which file to edit.

## 2. Generate a CV

```bash
pnpm run generate:ma-cv     # Medical Assistant (CCMA) focus
pnpm run generate:ekg-cv    # EKG technician focus
pnpm run generate:latest    # same as generate:ma-cv
pnpm run generate:cv        # default profile run, no focus override
```

All four wrap `scripts/generate-cv.js`. To call it directly:

```bash
node scripts/generate-cv.js --profile dawn --template healthcare --focus ekg
node scripts/generate-cv.js --help
```

Options: `--profile`, `--template`, `--focus`, `--output`, `--job`.
Markdown output lands in `output/`.

## 3. Make a PDF

```bash
node scripts/generate-pdf-simple.js output/<file>.md
```

An optional second argument sets the output PDF path; otherwise the PDF is written
next to the Markdown file. `pnpm run generate:pdf` runs the same script over
`output/dawn-*-cv-*.md`.

## 4. Check quality

```bash
pnpm run ai:quality-check
```

This scores `cv-versions/dawn-ekg-technician-cv.md` against healthcare keywords and
writes `quality-check.json`. To score a different file:

```bash
node scripts/evaluate-cv-quality.js output/<file>.md
```

`pnpm run check:quality` scores everything matching `output/dawn-*-cv-*.md`.

## Local API bridge (optional)

`scripts/serve-api.js` is a dependency-free HTTP server on port 4100 used by the
mobile app in `packages/mobile`. It is not wired to a pnpm script; run it directly:

```bash
node scripts/serve-api.js
```

Endpoints: `GET /profile`, `PUT /profile`, `POST /generate`, `GET /history`.

## CLI package

Once built, `packages/cli` exposes a `cv` binary:

```bash
pnpm run cv -- create --name "Dawn Zurick-Beilfuss" --email dawn@example.com
```

See `docs/reference/CLI-REFERENCE.md` for the full command surface.

## Where to look next

- `docs/user-guide/getting-started.md` - first-run walkthrough
- `docs/user-guide/advanced-usage.md` - templates, job-targeted CVs, scripts
- `docs/user-guide/troubleshooting.md` - common failures
- `docs/EKG_TECHNICIAN_CV_GENERATION.md` - the EKG/MA generation flow in detail
- `docs/examples/README.md` - worked examples
- `docs/technical/` - package internals
- `CONTRIBUTING.md` - development, commits, releases
