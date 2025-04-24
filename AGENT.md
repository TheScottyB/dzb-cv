# DZB-CV: Technical Documentation

## Project Overview

DZB-CV is a CV generator for Dawn Zurick Beilfuss that creates tailored resumes for different sectors (federal, state, private) from a single source of data. It features job posting analysis to optimize CVs for specific positions.

## Architecture

### Core Components

1. **Data Management**
   - `src/data/base-info.json`: Source of truth for CV data
   - `src/types/cv-types.ts`: TypeScript interfaces for data structures

2. **Generator System**
   - `src/generator.ts`: Core template processing logic
   - `src/utils/helpers.ts`: Utility functions
   - `src/utils/pdf-generator.ts`: PDF conversion with Puppeteer

3. **Job Analysis**
   - `src/utils/job-analyzer.ts`: Extracts data from job postings
   - `src/cli-job-analyzer.ts`: CLI for job analysis

4. **Templates**
   - `src/templates/{sector}/{sector}-template.md`: Sector-specific templates
   - `src/styles/pdf-styles.css`: Styling for PDF output

5. **CLI & Tools**
   - `src/cli.ts`: Main CV generation interface
   - `generate-pdf.js`: Helper script for PDF generation

## Data Flow

1. User invokes CLI with sector parameter
2. System loads CV data and selected template
3. Optional job analysis data is incorporated
4. Template is rendered with Handlebars
5. Output is saved as markdown and/or PDF

## Key Features

### CV Generator
- Supports federal, state, and private sector formats
- PDF generation with customizable styling
- Custom templates for each sector

### Job Analyzer
- Parses job postings from multiple sites
- Extracts key requirements and responsibilities
- Identifies relevant skills and qualifications
- Generates tailoring recommendations

### Asset Management
- Handles supporting files and metadata
- Manages versioning of generated CVs

## Implementation Details

### TypeScript Configuration
- ESM modules (all imports use `.js` extension)
- Strong typing for all data structures
- Type-safe template context generation

### Testing
- Jest for unit and integration tests
- Test cases for core generator functions
- Mocked external dependencies

### PDF Generation
- Uses Puppeteer for HTML to PDF conversion
- Custom CSS styling for professional output
- Configurable headers, footers, and metadata

## Development Guidelines

### Adding New Features
- Follow existing code patterns and naming conventions
- Update type definitions in `cv-types.ts`
- Add tests for new functionality

### Extending Job Analysis
- Add new site parsers in `job-analyzer.ts`
- Update analysis options as needed
- Ensure error handling for site-specific issues

### Template Customization
- Use Handlebars syntax consistently
- Add conditional sections for specific job requirements
- Test rendering with various data combinations

