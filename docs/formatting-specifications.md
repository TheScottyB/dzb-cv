# Formatting Specifications

## Overview

This document details the formatting specifications, text alignment rules, and styling guidelines used throughout the DZB-CV project. These specifications ensure consistent CV generation across all formats and provide guidance for anyone modifying templates or adding new content.

## Text Alignment Specifications

### Markdown Templates

The project uses standard Markdown formatting with these alignment conventions:

1. **Headings**
   - All headings use standard Markdown syntax (`#`, `##`, `###`)
   - No explicit alignment directives in the Markdown itself
   - Level 1 headings (`#`) are visually centered when rendered to PDF

2. **Lists**
   - All lists use standard Markdown bullet points (`-`) 
   - Lists maintain consistent indentation within sections
   - No custom alignment beyond standard Markdown formatting

3. **Text Blocks**
   - Professional summary sections use justified text alignment when rendered to PDF
   - All other text blocks default to left alignment
   - No explicit text alignment directives in the Markdown itself

### PDF Styling (pdf-styles.css)

The `src/styles/pdf-styles.css` file defines the following alignment rules for PDF generation:

```css
/* Main Headings */
h1 {
  font-size: 24pt;
  text-align: center; /* Center alignment for main headings */
  margin-top: 0.5em;
  color: #1a5276;
}

/* Professional Summary */
.professional-summary {
  margin: 1em 0 1.5em 0;
  text-align: justify; /* Justified text for professional summary */
}

/* Personal Information */
.personal-info {
  text-align: center; /* Center alignment for contact info */
  margin-bottom: 1.5em;
}

/* Table Cells */
th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left; /* Left alignment for table cells */
}
```

### PDF Generation Settings

Default settings defined in `src/utils/pdf-generator.ts`:

```typescript
export const DEFAULT_PDF_OPTIONS: PDFOptions = {
  paperSize: 'Letter',
  margins: {
    top: 0.75,
    right: 0.75,
    bottom: 0.75,
    left: 0.75
  },
  fontFamily: 'Arial, sans-serif',
  fontSize: 11,
  includeHeaderFooter: false,
  orientation: 'portrait',
  pdfCreator: 'DZB CV Generator'
};
```

## Sector-Specific Formatting

### Federal Format
- Highly structured with specific sections required by USAJOBS
- Detailed work experience entries with precise dates and hours
- Clearly delineated sections for citizenship and security clearance
- Additional information section for veterans' preference and federal status

### State Format
- Formal structure with state-specific requirements
- Consistent heading hierarchy for different experience types
- Special formatting for state employment history vs. other experience
- Section for state-specific professional licenses and certifications

### Private Sector Format
- More concise, achievement-focused layout
- Professional core competencies section at the beginning
- Experience entries include key projects and initiatives subsection
- Technical skills organized by category with concise descriptions

## Template Consistency Guidelines

All templates follow these consistency rules:

1. **Section Order**
   - Personal information first
   - Professional summary next
   - Work experience follows
   - Education and certifications after experience
   - Additional sections at the end

2. **Heading Hierarchy**
   - Level 1 (`#`): Document title or name
   - Level 2 (`##`): Major sections
   - Level 3 (`###`): Subsections or entry titles
   - Level 4+ rarely used

3. **Experience Entries**
   - Consistent format across all templates
   - Title and organization in heading
   - Duration or period clearly indicated
   - Responsibilities and achievements in bullet points

4. **Date Formatting**
   - Month and year for precise dates
   - Year only for education or certifications
   - Current positions indicated as "Present"

## ATS Optimization

When generating ATS-friendly versions (`--ats-friendly` option), the following modifications are applied:

```typescript
function makeATSFriendly(content: string): string {
  // Remove italics and bold formatting but keep the text
  content = content.replace(/\*\*(.*?)\*\*/g, '$1');
  content = content.replace(/\*(.*?)\*/g, '$1');
  
  // Replace markdown links with just the text
  content = content.replace(/\[(.*?)\]\(.*?\)/g, '$1');
  
  // Replace fancy quotes with plain quotes
  content = content.replace(/[""]/g, '"');
  content = content.replace(/['']/g, "'");
  
  // Remove emojis
  content = content.replace(/[\u{1F600}-\u{1F64F}]/gu, '');
  
  // Simplify bullet points to plain dashes or asterisks
  content = content.replace(/•/g, '-');
  
  // Ensure proper spacing after headings
  content = content.replace(/#{1,6}\s+(.*?)\n/g, '$1\n\n');
  
  return content;
}
```

## Tools Organization

The project uses several tools to manage formatting and styling:

1. **Core Rendering Engine**
   - `src/generator.ts`: Handles template rendering with Handlebars
   - `src/utils/helpers.ts`: Contains formatting helper functions

2. **PDF Generation**
   - `src/utils/pdf-generator.ts`: Main PDF conversion system
   - `src/styles/pdf-styles.css`: CSS styling for PDF output

3. **Sector Templates**
   - `src/templates/{sector}/{sector}-template.md`: Sector-specific templates
   - `src/components/*.md`: Reusable component templates

4. **Standalone Formatting Tools**
   - `utils/generate-job-pdf-template.js`: Template for job-specific PDF generation
   - `utils/generate-*-pdf.js`: Job-specific PDF generators

## Implementation Notes

When implementing new templates or modifying existing ones:

1. Follow the established heading hierarchy and formatting patterns
2. Maintain consistent indentation and list formatting
3. Use the existing CSS classes for proper styling
4. Test PDF generation to ensure alignment is preserved
5. Verify compatibility with ATS-friendly settings

For PDF styling modifications:

1. Edit the `src/styles/pdf-styles.css` file
2. Update the default settings in `src/utils/pdf-generator.ts` if needed
3. Test with all three sector templates to ensure consistency
4. Verify ATS-friendly output meets requirements

## Conclusion

These formatting specifications ensure consistent, professional output across all CV formats. By adhering to these guidelines, the project maintains a unified appearance while allowing for sector-specific customizations to meet different application requirements.