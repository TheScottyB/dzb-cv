# Examples

Worked examples of generating CVs with this repo. The rendered artefacts live in
`examples/` at the repo root; this page explains how to reproduce and adapt them.

## Reference output

`examples/ekg-cv-showcase/` holds a complete generated set:

| File | What it is |
| --- | --- |
| `Dawn_Zurick_Beilfuss_EKG_CV_2025.md` / `.html` / `.pdf` | Full EKG technician CV |
| `Dawn_Zurick_Beilfuss_Single_Page_CV.md` / `.html` / `.pdf` | Single-page variant |
| `Dawn_Zurick_Beilfuss_Single_Page_CV_Optimized.pdf` | Single-page after PDF optimisation |
| `Dawn_Zurick_Beilfuss_AI_Distilled_CV.md` / `.html` / `.pdf` | AI-distilled variant |
| `quality-report.json`, `single-page-quality-report.json`, `ai-distilled-quality-report.json` | Scores from `scripts/evaluate-cv-quality.js` |

The single-page Markdown file is also the fixture that `.github/workflows/ci.yml`
scores in its `test` and `quality` jobs.

## Healthcare CV, end to end

```bash
pnpm install
pnpm build

pnpm run generate:ekg-cv
node scripts/generate-pdf-simple.js output/dawn-ekg-cv-<date>.md
pnpm run ai:quality-check
```

Swap `generate:ekg-cv` for `generate:ma-cv` to produce the Medical Assistant (CCMA)
version. Details in `docs/EKG_TECHNICIAN_CV_GENERATION.md`.

## Single-page CV from the CLI

`cv create` reads `data/base-info.json` and writes a PDF directly:

```bash
pnpm run cv -- create \
  --name "Dawn Zurick-Beilfuss" \
  --email dawn@example.com \
  --single-page \
  --output output/dawn-single-page-cv.pdf
```

`--template` accepts `default`, `minimal`, `federal` or `academic`, and `--format`
accepts `A4` or `Letter`. See `docs/reference/CLI-REFERENCE.md`.

## Federal CV

```bash
pnpm run cv -- create \
  --name "Dawn Zurick-Beilfuss" \
  --email dawn@example.com \
  --template federal \
  --format Letter \
  --output output/dawn-federal-cv.pdf
```

`data/templates/federal/federal-template.md` is a Handlebars reference layout showing
the fields a USAJOBS-style CV is expected to carry: citizenship, hours per week,
grade equivalent, salary and supervisor per position. It is a reference document, not
a file the generators render.

## ATS scoring

`packages/ats` provides the analyzers and scoring used to check how a CV reads to an
applicant tracking system (`createAnalyzer`, `CVAnalyzer`, plus the scoring and
taxonomy modules exported from `packages/ats/src/index.ts`).

From the command line, `scripts/evaluate-cv-quality.js` reports relevance,
information density, readability, length compliance and orphaned headers:

```bash
node scripts/evaluate-cv-quality.js examples/ekg-cv-showcase/Dawn_Zurick_Beilfuss_Single_Page_CV.md \
  --keywords 'healthcare,EKG,technician,patient care' \
  --export quality-check.json
```

ATS-friendly formatting that the scorer rewards: plain `#`/`##` section headers with
conventional names, `-` bullets rather than decorative glyphs, `2020 - Present` date
ranges, and contact details as plain text on their own line.

## Profile data

`base-info.json` at the repo root is the canonical profile; `data/base-info.json` is
the synced copy that `cv create` reads. Edit the root file, regenerate, and keep the
copy in step (`scripts/serve-api.js` writes both on `PUT /profile`).

Version history is handled by Git, not by an in-repo profile store.

## See also

- `USAGE.md`
- `docs/user-guide/advanced-usage.md`
- `docs/reference/CLI-REFERENCE.md`
- `CONTRIBUTING.md`
