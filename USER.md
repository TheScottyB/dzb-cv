# DZB-CV: User Guide

## Introduction

DZB-CV is a specialized tool for generating tailored CVs for different job sectors from a single source of data. This guide explains how to use, customize, and manage your CV generation process.

## Getting Started

### Prerequisites

- Node.js 18 or later
- pnpm package manager

### Installation

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Build the project:
   ```bash
   pnpm build
   ```

## Using the CV Generator

### Available CV Formats

This tool generates three types of CVs:

1. **Federal Format** - Detailed resumes for US federal government applications, following USAJOBS requirements
2. **State Format** - CV format optimized for state government applications
3. **Private Sector** - Concise, achievement-focused CV for private industry

### Generating CVs

```bash
# Generate a specific CV format
pnpm start -- --sector=federal
pnpm start -- --sector=state
pnpm start -- --sector=private

# Analyze a job posting and create tailored CV
pnpm analyze-job <job-posting-url>
```

### Output Location

Generated CVs are saved to:
- `output/federal/` - Federal job applications
- `output/state/` - State job applications 
- `output/private/` - Private sector applications

## Customizing Your CV

### Updating Personal Information

Edit `src/data/base-info.json` to update:
- Personal details (name, contact info)
- Work experience
- Education history
- Skills and qualifications

### Customizing Templates

Each sector has its own template file in `src/templates/{sector}/{sector}-template.md`

Templates use Handlebars syntax:
- Variable substitution: `{{variable}}`
- Loops: `{{#each items}}...{{/each}}`
- Conditionals: `{{#if condition}}...{{/if}}`

### Creating Job-Specific CVs

1. Analyze a job posting:
   ```bash
   pnpm analyze-job <job-posting-url> --output=job-analysis.json
   ```

2. Use the generated job analysis to create a tailored CV:
   ```bash
   node generate-pdf.js
   ```

## CV Format Details

### Federal CV Format
- Detailed work history with specific dates and hours
- Salary information and supervisor contacts
- Citizenship and security clearance information

### State CV Format
- State-specific formatting requirements
- Detailed experience relevant to state positions
- Required certifications and education details

### Private Sector CV Format
- Concise, achievement-focused format
- Emphasis on relevant skills and qualifications
- Optimized for applicant tracking systems

## Troubleshooting

- **Template Errors**: Check Handlebars syntax if CV generation fails
- **Missing Information**: Ensure all required fields exist in base-info.json
- **PDF Generation**: Run `npx puppeteer browsers install chrome` if PDF generation fails

## Support

For questions or issues, please contact the repository administrator.

