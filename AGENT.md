# DZB-CV: Technical Documentation

## Project Overview

DZB-CV is a specialized CV/resume generator for Dawn Zurick Beilfuss that creates tailored resumes for different sectors (federal, state, and private) from a single source of data. The project uses TypeScript with ESM modules and Handlebars for templating.

## Architecture

### Core Components

1. **Data Layer**
   - `src/data/base-info.json`: Central source of truth for CV data
   - `src/types/cv-types.ts`: TypeScript interfaces defining CV data structure

2. **Generator Engine**
   - `src/generator.ts`: Core logic for processing templates and data
   - `src/utils/helpers.ts`: Utility functions for data loading and processing

3. **Templates**
   - `src/templates/{sector}/{sector}-template.md`: Sector-specific Handlebars templates
   - Templates follow a consistent structure but with sector-specific formatting

4. **Command Line Interface**
   - `src/cli.ts`: Provides CLI for generating CVs with options

5. **Testing Framework**
   - `src/__tests__/`: Jest tests for core functionality
   - ESM-compatible test configuration

## Data Flow

1. User invokes CLI with sector parameter
2. System loads CV data from `base-info.json`
3. System loads appropriate sector template
4. Handlebars processes template with data
5. Output is saved to `output/{sector}/` directory

## Module Details

### CV Data Structure

The CV data follows this structure (defined in `cv-types.ts`):
- Personal Information (name, contact details)
- Work Experience (company, position, dates, achievements)
- Education (institution, degree, dates)
- Skills (categorized skills with proficiency levels)
- Sector-specific requirements and formatting

### Template System

Templates use Handlebars syntax:
- Variable substitution: `{{variable}}`
- Sections/loops: `{{#each items}}...{{/each}}`
- Conditionals: `{{#if condition}}...{{/if}}`

Each sector template emphasizes different aspects:
- Federal: Detailed work history with specific requirements for government applications
- State: Format optimized for state government applications
- Private: Concise, achievement-focused format for private sector

### Build System

- TypeScript with ESM modules
- Jest for testing
- pnpm for package management

## Implementation Notes

1. **ESM Compatibility**
   - All imports use `.js` extension even for TypeScript files
   - Module resolution configured for Node.js ESM

2. **Testing Approach**
   - Jest configured for ESM support
   - Tests verify data loading and template processing

3. **Extensibility**
   - New templates can be added by creating new sector directories
   - Helper functions can be extended for additional data processing

## Development Guidelines

1. **Adding New CV Sections**
   - Update `cv-types.ts` with new interface properties
   - Add corresponding data to `base-info.json`
   - Update templates to include new sections

2. **Creating New Templates**
   - Add new directory under `src/templates/`
   - Create template file with Handlebars syntax
   - Update CLI to support new template type

3. **Testing Changes**
   - Add tests for new functionality
   - Run tests with `pnpm test`
   - Verify output manually for formatting accuracy

