# DZB-CV: User Guide

## Introduction

DZB-CV is a specialized tool for generating tailored CVs for different job sectors from a single source of data. This guide explains how to use, customize, and manage your CV generation process.

## Getting Started

### Prerequisites

- Node.js 20.10.0 or higher
- pnpm 8.12.1 or higher

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
dzb-cv generate federal
dzb-cv generate state
dzb-cv generate private

# Generate with additional options
dzb-cv generate federal --format markdown --output ./my-output --filename my-cv

# Analyze a job posting and create tailored CV
dzb-cv analyze <job-posting-url>

# Analyze with additional options
dzb-cv analyze <job-posting-url> --output ./analysis.json --format json
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

Each sector has its own template file in `src/shared/templates/{sector}/{sector}-template.md`

Templates use Handlebars syntax:
- Variable substitution: `{{variable}}`
- Loops: `{{#each items}}...{{/each}}`
- Conditionals: `{{#if condition}}...{{/if}}`

### Creating Job-Specific CVs

1. Analyze a job posting:
   ```bash
   dzb-cv analyze <job-posting-url> --output ./job-analysis.json --format json
   ```

2. Generate a tailored CV with ATS optimization:
   ```bash
   dzb-cv generate private --ats-optimize
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
- **PDF Generation**: If PDF generation fails, try rebuilding the project with `pnpm build`
- **Command Not Found**: If `dzb-cv` command is not found, link the CLI globally with `pnpm link-cli`

## Support

For questions or issues, please contact the repository administrator.

