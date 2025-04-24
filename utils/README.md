# CV Utility Tools

This directory contains utility scripts to help manage CV content, validate new submissions, and generate output files.

## Available Tools

### CV Validator

Validates that a CV text belongs to Dawn Zurick Beilfuss by checking for identity markers, experience references, and skills alignment. It also compares with existing CVs to show a diff of changes.

```bash
node utils/cv-validator.js <input_file_path>
```

This tool:
1. Checks for identity markers (name, email, phone)
2. Validates experience and skills alignment
3. Compares with the most similar existing CV
4. Shows a colored diff of changes
5. Saves validated CVs to the cv-versions directory

### CV Text Importer

Imports CV text from various sources (Word, PDF, HTML, LinkedIn), preprocesses it, and prepares it for validation.

```bash
node utils/import-cv-text.js [output_path]
```

Features:
- Automatic source format detection
- Format-specific preprocessing
- Conversion to markdown-compatible format
- Proper formatting of headers, list items, and paragraphs
- Front matter with import metadata

### PDF Generator

Generates PDF versions of CV markdown files with appropriate styling.

```bash
node utils/generate-pdf.js [input_path] [output_path]
```

The generator:
- Converts markdown to styled HTML
- Applies sector-appropriate styling
- Produces professional PDF output
- Adds headers and footers as needed

## Workflow Example

A typical workflow using these tools:

1. Import new CV text:
   ```bash
   node utils/import-cv-text.js new-cv.txt
   ```

2. Validate the imported CV:
   ```bash
   node utils/cv-validator.js new-cv.txt
   ```

3. Generate a PDF from the validated CV:
   ```bash
   node utils/generate-pdf.js
   ```

4. Move to appropriate sector directory:
   ```bash
   cp cv-versions/new-cv.md output/state/
   cp output/state/new-cv.pdf output/state/
   ```