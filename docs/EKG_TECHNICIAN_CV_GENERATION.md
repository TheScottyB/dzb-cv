# EKG Technician CV Generation

How to produce Dawn's EKG-technician CV, and the closely related Medical Assistant
(CCMA) variant.

## Generate the Markdown

```bash
pnpm run generate:ekg-cv    # EKG technician focus
pnpm run generate:ma-cv     # Medical Assistant (CCMA) focus
```

Both wrap `scripts/generate-cv.js`:

```bash
node scripts/generate-cv.js --profile dawn --template healthcare --focus ekg
node scripts/generate-cv.js --profile dawn --template healthcare --focus ma
```

Output is written to `output/dawn-<focus>-cv-<YYYY-MM-DD>.md`, for example
`output/dawn-ekg-cv-2026-09-11.md`. Pass `--output <path>` to choose a different
location.

## Generate the PDF

```bash
node scripts/generate-pdf-simple.js output/dawn-ekg-cv-2026-09-11.md
```

A second argument sets the PDF path; otherwise the PDF is written alongside the
Markdown file. `pnpm run generate:pdf` runs the same script over
`output/dawn-*-cv-*.md`.

`scripts/generate-pdf-simple.js` loads the built `@dzb-cv/pdf` package from
`packages/pdf/dist/index.js`, building it first if it is missing. Run `pnpm build`
once before generating PDFs.

## Source data

- `base-info.json` at the repo root is the canonical profile, read by
  `scripts/generate-cv.js`.
- `cv-versions/dawn-ekg-technician-cv.md` is a maintained hand-edited EKG CV used as
  the quality-check baseline; `cv-versions/dawn-ekg-technician-cv-optimized.md` is the
  distilled single-page variant.
- `data/templates/healthcare/ekg-technician-template.md` is a standalone reference
  layout. No code reads it; `scripts/generate-cv.js` composes the healthcare CV in
  code from the profile data.

To change the content, edit `base-info.json` and regenerate. To change the structure
or wording of the healthcare CV itself, edit the section builders in
`scripts/generate-cv.js`.

## Check quality

```bash
pnpm run ai:quality-check
```

Scores `cv-versions/dawn-ekg-technician-cv.md` against healthcare keywords and writes
`quality-check.json`. To score a freshly generated file:

```bash
node scripts/evaluate-cv-quality.js output/dawn-ekg-cv-2026-09-11.md
```

## Prerequisites

- Node.js >= 20.10.0 and pnpm >= 10.9.0
- `pnpm install` and `pnpm build`
- Chrome/Chromium for PDF rendering. In a container, `pnpm run install:chrome` runs
  `install-chrome-codespaces.sh`.

## Troubleshooting

- PDF package not found: run `pnpm build`, or `cd packages/pdf && pnpm build`.
- Puppeteer fails to launch: install Chrome as above; in restricted sandboxes it may
  need `--no-sandbox`.
- Profile not loading: confirm `base-info.json` exists at the repo root and is valid
  JSON.

## Examples

Rendered reference output lives in `examples/ekg-cv-showcase/`, including
`Dawn_Zurick_Beilfuss_EKG_CV_2025.md` and
`Dawn_Zurick_Beilfuss_Single_Page_CV.md`.
