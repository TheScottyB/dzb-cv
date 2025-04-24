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

## Project Structure Overview

```
dzb-cv/
├── src/               # Core CV generation code
│   ├── templates/     # CV templates for each sector
│   ├── components/    # Reusable CV components
│   ├── data/          # CV data files
│   ├── utils/         # Helper functions
│   │   ├── job-analyzer.ts      # Job posting analysis
│   │   ├── pdf-generator.ts     # Markdown to PDF conversion
│   │   ├── cv-parser.ts         # CV parsing utilities
│   │   └── web-scraper.ts       # Job posting scraper
│   ├── types/         # TypeScript type definitions
│   ├── styles/        # CSS styles for PDF generation
│   ├── cli.ts         # Original CLI entry point
│   ├── cli-unified.ts # Unified CLI tool entry point
│   └── generator.ts   # Core template rendering
├── utils/             # Standalone utility scripts
│   ├── cv-validator.js         # Validates CV content
│   ├── import-cv-text.js       # Imports CV text from various formats
│   ├── generate-pdf.js         # Standalone PDF generation
│   ├── import-to-pdf.js        # Converts imports directly to PDF
│   ├── generate-tailored-pdf.js # Creates tailored job application PDFs
│   └── generate-cover-letter-pdf.js # Cover letter generation
├── cv-versions/       # Version-controlled CV markdown files
├── output/            # Generated CVs in various formats
│   ├── federal/       # Federal job applications
│   ├── state/         # State job applications
│   ├── private/       # Private sector applications
│   └── sites/         # Job site optimized versions
└── assets/            # Supporting documents and images
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

#### 4. Scrape Job Postings from Websites

```bash
pnpm cv -- scrape <url> [options]
```

Arguments:
- `url` - The URL of the job posting to scrape

Options:
- `--output <path>` - Output directory (default: output/scraped)
- `--no-headless` - Run in non-headless mode (shows browser UI)
- `--wait <ms>` - Wait time in milliseconds after page load (default: 5000)
- `--no-screenshot` - Do not save screenshot
- `--pdf` - Save PDF of the page
- `--analyze` - Analyze the scraped job posting after scraping

Example:
```bash
# Scrape in headless mode (no visible browser)
pnpm cv -- scrape https://indeed.com/viewjob?jk=12345

# Scrape with visible browser window
pnpm cv -- scrape https://linkedin.com/jobs/view/12345 --no-headless

# Scrape, analyze, and optionally generate CV
pnpm cv -- scrape https://monster.com/job/12345 --analyze
```

This command uses Puppeteer to scrape job postings in one of three ways:

1. **Headless Browser (Default):** Fast, invisible browser automation
2. **Visible Browser (`--no-headless`):** Shows the browser UI for monitoring
3. **Existing Browser (`--use-existing-browser`):** Connects to a Chrome instance you've already started

The command saves:
- HTML file of the job posting
- Screenshot of the job posting page
- Text file containing the structured job details
- Optional PDF of the entire page

For sites with strong anti-scraping measures (like Indeed), the recommended approach is:

```bash
# Step 1: Start Chrome with remote debugging enabled
chrome --remote-debugging-port=9222   # On macOS: /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222

# Step 2: Manually navigate to the job posting and login if needed

# Step 3: Run the scraper connected to your browser instance
pnpm cv -- scrape <URL> --use-existing-browser --analyze
```

This approach bypasses most anti-scraping measures since it uses your authenticated browser session.

#### 5. Generate Job Site Optimized CV

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
