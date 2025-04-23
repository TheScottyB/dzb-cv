# DZB-CV: User Guide

## Introduction

DZB-CV is a specialized tool for generating tailored CVs for different job sectors from a single source of data. This guide explains how to use, customize, and manage your CV generation process.

## Getting Started

### Prerequisites

- Node.js 16 or later
- pnpm package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/TheScottyB/dzb-cv.git
   cd dzb-cv
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Build the project:
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

#### Generate a specific CV format:

```bash
# Generate Federal CV
pnpm generate:federal

# Generate State CV
pnpm generate:state

# Generate Private Sector CV
pnpm generate:private
```

#### Generate all CV formats at once:

```bash
pnpm generate:all
```

### Output Location

Generated CVs are saved to:
- `output/federal/` - Federal format CVs
- `output/state/` - State format CVs
- `output/private/` - Private sector CVs

## Customizing Your CV

### Updating Personal Information

1. Edit `src/data/base-info.json` to update:
   - Personal details (name, contact info)
   - Work experience
   - Education history
   - Skills and qualifications
   - Additional sector-specific information

Example:
```json
{
  "personalInfo": {
    "name": {
      "full": "Dawn Zurick Beilfuss",
      "preferred": "Dawn Zurick"
    },
    "contact": {
      "email": "your-email@example.com",
      "phone": "123-456-7890"
    }
  },
  // Additional sections...
}
```

### Customizing Templates

Each sector has its own template file:
- `src/templates/federal/federal-template.md`
- `src/templates/state/state-template.md`
- `src/templates/private/private-template.md`

You can modify these templates to change the format and content of your generated CVs. Templates use Handlebars syntax:

- Display a value: `{{valueName}}`
- Loop through items: `{{#each items}}...{{/each}}`
- Conditional content: `{{#if condition}}...{{/if}}`

## CV Format Details

### Federal CV Format

The federal CV format includes:
- Detailed work history with specific dates
- Hours worked per week
- Salary information
- Supervisor contact information
- Citizenship and security clearance information

This format is optimized for USAJOBS and federal application requirements.

### State CV Format

The state CV format includes:
- State-specific formatting requirements
- Detailed experience relevant to state positions
- Education details with emphasis on relevant qualifications

This format is tailored for state government applications.

### Private Sector CV Format

The private sector CV format includes:
- Concise presentation of experience
- Achievement-focused bullet points
- Emphasis on relevant skills and qualifications

This format is designed for private industry applications.

## Tips for Effective CV Management

1. **Keep Your Data Updated**
   - Regularly update your base information
   - Add new positions and accomplishments as you gain them

2. **Customize for Specific Applications**
   - Temporarily modify templates for specific job applications
   - Highlight relevant experience for each position

3. **Version Control**
   - Use git to track changes to your CV data and templates
   - Consider tagging important versions for future reference

## Troubleshooting

- **Template Errors**: Check Handlebars syntax if CV generation fails
- **Missing Information**: Ensure all required fields are in your base-info.json
- **Build Issues**: Run `pnpm build` to ensure all TypeScript files are compiled

## Support

For questions or issues, please open an issue on the GitHub repository.

