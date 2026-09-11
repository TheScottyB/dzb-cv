# CLI Reference

Two command surfaces exist in this repo: the `cv` binary from `packages/cli`, and the
Node scripts in `scripts/` that the root `package.json` wraps as pnpm scripts.

## The `cv` binary

Source: `packages/cli/src/index.ts`. Built to `packages/cli/dist/index.js` and exposed
as the `cv` bin by `packages/cli/package.json`.

Build it first:

```bash
pnpm install
pnpm build
```

Then run it one of three ways:

```bash
pnpm run cv -- --help                  # via the root "cv" script
node packages/cli/dist/index.js --help # direct
pnpm run link-cli && cv --help         # after npm link; undo with pnpm run unlink-cli
```

### `cv create`

The only command currently registered (`packages/cli/src/commands/create.ts`).
It reads `data/base-info.json` from the current working directory, transforms it into
CV data, and writes a PDF.

```
cv create --name <name> --email <email> [options]
```

Required:

| Option | Alias | Description |
| --- | --- | --- |
| `--name <name>` | `-n` | Full name |
| `--email <email>` | `-e` | Email address |

Optional:

| Option | Alias | Default | Description |
| --- | --- | --- | --- |
| `--output <file>` | `-o` | `<name>-cv.pdf` | Output PDF path |
| `--single-page` | | off | Force the PDF onto one page |
| `--template <template>` | | `default` | `default`, `minimal`, `federal`, `academic` |
| `--format <format>` | | `Letter` | `A4` or `Letter` |

Examples:

```bash
pnpm run cv -- create --name "Dawn Zurick-Beilfuss" --email dawn@example.com
pnpm run cv -- create -n "Dawn Zurick-Beilfuss" -e dawn@example.com --single-page -o output/dawn-cv.pdf
pnpm run cv -- create -n "Dawn Zurick-Beilfuss" -e dawn@example.com --template federal --format A4
```

Notes:

- If `data/base-info.json` cannot be read, the command warns and falls back to a
  minimal CV built only from the name and email.
- The output path is validated to stay inside the current working directory
  (see `docs/decisions/0003-validate-cli-output-paths.md`); missing directories are
  created.
- Exit code 0 on success, 1 on failure.

## Generation scripts

Defined in the root `package.json`.

| Command | Runs |
| --- | --- |
| `pnpm run generate:ma-cv` | `scripts/generate-cv.js --profile dawn --template healthcare --focus ma` |
| `pnpm run generate:ekg-cv` | `scripts/generate-cv.js --profile dawn --template healthcare --focus ekg` |
| `pnpm run generate:cv` | `scripts/generate-cv.js --profile dawn` |
| `pnpm run generate:latest` | same as `generate:ma-cv` |
| `pnpm run generate:pdf` | `scripts/generate-pdf-simple.js output/dawn-*-cv-*.md` |
| `pnpm run update:profile` | prints which profile file to edit |

`scripts/generate-cv.js` options: `--profile <name>`, `--template <type>`,
`--focus <area>`, `--output <path>`, `--job <file>`, `--help`. It reads
`base-info.json` at the repo root and writes
`output/<profile>-<focus>-cv-<date>.md` unless `--output` is given.

`scripts/generate-pdf-simple.js` takes an input Markdown path and an optional output
PDF path:

```bash
node scripts/generate-pdf-simple.js output/dawn-ekg-cv-2026-09-11.md
```

## Quality and AI scripts

| Command | Runs |
| --- | --- |
| `pnpm run ai:quality-check` | `scripts/evaluate-cv-quality.js cv-versions/dawn-ekg-technician-cv.md` with healthcare keywords, exporting `quality-check.json` |
| `pnpm run ai:evaluate` | `scripts/evaluate-cv-quality.js` (pass your own file) |
| `pnpm run check:quality` | `scripts/evaluate-cv-quality.js output/dawn-*-cv-*.md` |
| `pnpm run ai:test` | `scripts/test-ai-distillation.js` |
| `pnpm run ai:ab-test` | `scripts/simple-ab-test.js` |
| `pnpm run ai:benchmark` | `scripts/simple-ab-test.js` on the EKG CV, exporting `benchmark-results.json` |
| `pnpm run ai:full-test` | `ai:quality-check` then `scripts/test-ai-distillation.js` |

`scripts/evaluate-cv-quality.js` accepts `--keywords '<comma,separated>'` and
`--export <file.json>`.

## Repo scripts

| Command | Runs |
| --- | --- |
| `pnpm run setup` | `scripts/setup-dzb-cv.sh` |
| `pnpm run setup:quick` | `pnpm install && pnpm run build` |
| `pnpm run link-cli` / `unlink-cli` | npm link/unlink for `packages/cli` |
| `pnpm run install:chrome` | `install-chrome-codespaces.sh` |
| `pnpm run dawn:setup` | `scripts/customize-fork.js` |
| `pnpm build` / `pnpm lint` / `pnpm typecheck` | Turbo tasks across packages |
| `pnpm test` / `pnpm run test:e2e` | Vitest and Playwright |

## Local API bridge

`scripts/serve-api.js` serves `base-info.json` and generation over HTTP on port 4100
for `packages/mobile`. It has no pnpm script; run `node scripts/serve-api.js`.
Endpoints: `GET /profile`, `PUT /profile`, `POST /generate`, `GET /history`.

## See also

- `USAGE.md` - the everyday workflow
- `docs/user-guide/advanced-usage.md` - templates and job-targeted CVs
- `docs/reference/Reference.md` - API and configuration reference
