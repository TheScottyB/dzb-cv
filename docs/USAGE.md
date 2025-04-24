# Dawn's CV Toolkit - Usage Guide

## Setup
1. Install dependencies:
```bash
pnpm install
```

2. Build the project:
```bash
pnpm build
```

## Unified CV Toolkit

The new unified CLI tool provides a comprehensive approach to managing CVs and job applications.

```bash
pnpm cv -- [command] [options]
```

### Available Commands

#### 1. Analyze a Job Posting

```bash
pnpm cv -- analyze <job-url> [options]
```

Options:
- `--output <path>` - Save analysis to a JSON file
- `--force-generic` - Force using the generic parser
- `--no-rate-limit` - Disable rate limiting (use with caution)

Example:
```bash
pnpm cv -- analyze https://jobsite.com/job/12345
```

#### 2. Generate a CV

```bash
pnpm cv -- generate <sector> [options]
```

Arguments:
- `sector` - The sector to generate for (federal, state, private)

Options:
- `-f, --format <format>` - Output format: markdown or pdf (default: pdf)
- `-o, --output <path>` - Output directory (default: output)
- `--filename <name>` - Base filename for the generated CV

Example:
```bash
pnpm cv -- generate state --format pdf
```

#### 3. Import a CV

```bash
pnpm cv -- import <file> [options]
```

Arguments:
- `file` - Path to the markdown CV file

Options:
- `-o, --owner <name>` - Name of the profile owner (default: Dawn Zurick Beilfuss)

Example:
```bash
pnpm cv -- import cv-versions/dawn-illinois-state-cv.md
```

#### 4. Generate Job Site Optimized CV

```bash
pnpm cv -- site-cv <site> [options]
```

Arguments:
- `site` - The job site to optimize for (indeed, linkedin, usajobs, monster)

Options:
- `-o, --output <path>` - Output directory (default: output/sites)
- `-f, --format <format>` - Output format: pdf or docx (default: pdf)
- `--ats-friendly` - Generate an ATS-friendly version with minimal formatting
- `--include-all` - Include all experience sections (default: optimized selection)

Example:
```bash
pnpm cv -- site-cv indeed --ats-friendly
```

This command creates a CV optimized for uploading to specific job sites, with appropriate formatting and content selection based on the platform's preferences and ATS (Applicant Tracking System) considerations.

#### 5. Complete Job Application Workflow

```bash
pnpm cv -- apply <job-url> [options]
```

Arguments:
- `job-url` - The URL of the job posting to apply for

Options:
- `-s, --sector <sector>` - The sector for the CV (default: state)
- `-o, --output <path>` - Base output directory (default: output)

Example:
```bash
pnpm cv -- apply https://jobsite.com/job/12345 --sector state
```

### Recommended Workflow for Job Applications

1. **Analyze the job posting**:
   ```bash
   pnpm cv -- analyze https://jobsite.com/job/12345
   ```

2. **Create a tailored application package**:
   ```bash
   pnpm cv -- apply https://jobsite.com/job/12345 --sector state
   ```

3. **Review and submit**:
   - Review the generated CV and cover letter
   - Make any necessary edits
   - Submit the application

## Legacy Commands

### Generate a specific sector CV:
- Federal CV: `pnpm start -- --sector=federal`
- State CV: `pnpm start -- --sector=state`
- Private Sector CV: `pnpm start -- --sector=private`

## Project Structure

```
dzb-cv/
├── src/
│   ├── templates/       # CV templates for each sector
│   ├── data/           # CV data files
│   ├── utils/          # Helper functions
│   └── types/          # TypeScript type definitions
├── output/             # Generated CVs
│   ├── federal/
│   ├── state/
│   └── private/
└── assets/            # Supporting documents and images
```

## Adding New Content

1. Update base information in `src/data/base-info.json`
2. Modify templates in `src/templates/<sector>` as needed
3. Run appropriate generate command

## Customizing Templates

Templates use Handlebars syntax and support:
- Variable substitution: `{{variable}}`
- Loops: `{{#each items}}...{{/each}}`
- Conditionals: `{{#if condition}}...{{/if}}`

## Version Control

- CV versions are tracked in git
- Generated files are stored in `output/<sector>/<date>/`
- Support files are stored in `assets/`
