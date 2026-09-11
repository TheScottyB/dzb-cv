# Advanced Usage

Beyond the basic workflow in `USAGE.md`. Everything here is backed by a script or
command that exists in this repo.

## Profile data

`base-info.json` at the repo root is the canonical profile. `scripts/generate-cv.js`
reads it and adapts it through `scripts/profile-adapter.js`.

`data/base-info.json` is a synced copy read by the `cv create` command in
`packages/cli`. Keep the two in step; `scripts/serve-api.js` writes both on
`PUT /profile`.

## Focused generation

`scripts/generate-cv.js` takes a focus area and composes the CV in code from the
profile data:

```bash
node scripts/generate-cv.js --profile dawn --template healthcare --focus ma
node scripts/generate-cv.js --profile dawn --template healthcare --focus ekg
node scripts/generate-cv.js --profile dawn --output output/dawn-cv-latest.md
node scripts/generate-cv.js --help
```

| Option | Purpose |
| --- | --- |
| `--profile <name>` | Profile to load (default `dawn`) |
| `--template <type>` | Template family, e.g. `healthcare` |
| `--focus <area>` | `ma`, `ekg`, `medical`, `general` |
| `--output <path>` | Output path (default `output/<profile>-<focus>-cv-<date>.md`) |
| `--job <file>` | Job posting file to target the CV at |

The MA focus reorders credentials so the CCMA leads and moves real-estate licences to
a separate line; the EKG focus keeps the cardiac-monitoring emphasis. Both behaviours
live in `scripts/generate-cv.js`.

## Job-targeted CVs

```bash
node scripts/generate-cv.js --profile dawn --job path/to/job-posting.txt
```

Supporting tools:

- `scripts/job-analyzer.js` - analyse a saved posting
- `scripts/analyzer.js` and `scripts/optimizer.js` - scoring and optimisation helpers
- `packages/job-analyzer` - the underlying posting-analysis package

## PDF options

The simple path is `scripts/generate-pdf-simple.js`, which uses the built
`@dzb-cv/pdf` package:

```bash
node scripts/generate-pdf-simple.js output/dawn-ma-cv-2026-09-11.md
node scripts/generate-pdf-simple.js output/dawn-ma-cv-2026-09-11.md output/dawn-ma.pdf
```

`scripts/pdf-generator.js` exposes the lower-level generator. For single-page output
through the CLI:

```bash
pnpm run cv -- create --name "Dawn Zurick-Beilfuss" --email dawn@example.com \
  --single-page --template federal --format A4 --output output/dawn-federal-cv.pdf
```

Templates accepted by `cv create`: `default`, `minimal`, `federal`, `academic`
(see `docs/reference/CLI-REFERENCE.md`).

## Batch generation

```bash
#!/bin/bash
for focus in ma ekg; do
  node scripts/generate-cv.js --profile dawn --template healthcare --focus "$focus"
done

for md in output/dawn-*-cv-*.md; do
  node scripts/generate-pdf-simple.js "$md"
done
```

`pnpm run generate:pdf` does the second loop for you.

## Quality evaluation

```bash
node scripts/evaluate-cv-quality.js output/dawn-ma-cv-2026-09-11.md \
  --keywords 'healthcare,EKG,technician,patient care' \
  --export quality-check.json
```

Scored on relevance, information density, readability, length compliance and orphaned
headers. `pnpm run ai:quality-check` runs this against the baseline CV in
`cv-versions/`, and `pnpm run ai:ab-test` / `pnpm run ai:benchmark` compare
distillation settings via `scripts/simple-ab-test.js`.

## React templates

`packages/templates` holds the React-rendered templates (`basic` and `modern`) used by
the PDF pipeline. Add a new one alongside `packages/templates/src/basic/` and export
it from `packages/templates/src/index.ts`.

The Handlebars-style Markdown templates under `data/templates/` and
`src/shared/templates/` are reference layouts; the generation scripts build their
output in code rather than rendering those files.

## Local API bridge

`scripts/serve-api.js` runs a dependency-free JSON API on port 4100 for
`packages/mobile`:

```bash
node scripts/serve-api.js
```

`GET /profile`, `PUT /profile` (validates and writes both profile files),
`POST /generate`, `GET /history`.

## See also

- `docs/user-guide/getting-started.md`
- `docs/user-guide/troubleshooting.md`
- `docs/reference/CLI-REFERENCE.md`
- `docs/technical/README.md`
