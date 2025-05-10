---
path: docs/technical/PDF-GENERATION.md
type: technical
category: pdf
maintainer: system
last_updated: 2025-05-10
related_files:
  - docs/technical/NAMING-CONVENTIONS.md
  - docs/technical/DATA-VERIFICATION.md
---

# PDF Generation Technical Documentation

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Key Features](#key-features)
- [Implementation Details](#implementation-details)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)
- [Future Improvements](#future-improvements)
- [Related Documentation](#related-documentation)

## Overview
The PDF generation system in DZB-CV provides robust, sector-specific, and ATS-optimized CV and cover letter generation. It supports custom styling, advanced content processing, and flexible output options for federal, state, and private sector applications.

## Architecture
The system consists of three main components:
1. **Style Management**
   - CSS variables for consistent theming
   - Sector-specific styles (federal, state, private)
   - ATS-optimized formatting options
2. **Content Processing**
   - Enhanced Markdown rendering
   - HTML structure optimization
   - Page break control
3. **PDF Generation**
   - Puppeteer-based rendering
   - Configurable headers/footers
   - Custom styling injection

## Key Features
### ATS Optimization
```typescript
interface StyleOptions extends PDFOptions {
  atsOptimized?: boolean;  // Enables ATS-friendly formatting
}
```
When `atsOptimized` is enabled:
- Simplified heading structure
- Semantic HTML elements
- Reduced styling complexity
- Plain text fallbacks

### Sector-Specific Styling
```typescript
type CVType = 'federal' | 'state' | 'private';
// Usage example:
const options: StyleOptions = {
  cvType: 'federal',
  atsOptimized: true
};
```
Each sector has specific requirements:
- Federal: USAJobs formatting
- State: Government standards
- Private: Modern professional layout

### CSS Processing Pipeline
1. **Base Styles**
   ```css
   :root {
     --text-primary: #333333;
     --text-secondary: #2c3e50;
     // ... other variables
   }
   ```
2. **Sector Customization**
   ```css
   .federal-header {
     background-color: var(--bg-federal);
     padding: var(--spacing-sm);
   }
   ```
3. **ATS Optimization**
   ```css
   .ats-optimized {
     font-family: Arial, sans-serif;
     line-height: 1.5;
     // ... other ATS-friendly styles
   }
   ```

## Implementation Details
### Enhanced Markdown Rendering
```typescript
function convertMarkdownToHtml(markdownContent: string): string {
  const md = new MarkdownIt({
    html: true,
    breaks: true,
    linkify: true,
    typographer: true
  });
  // Custom renderer for ATS compatibility
  md.renderer.rules.heading_open = (tokens, idx) => {
    const token = tokens[idx];
    const level = parseInt(token.tag.slice(1), 10);
    return `<${token.tag} class="cv-heading-${level}">`;
  };
  return md.render(markdownContent);
}
```

### Style Loading System
```typescript
async function loadStylesheet(options: StyleOptions): Promise<string> {
  // Load base styles
  let baseCSS = await loadBaseStyles();
  // Add sector-specific styles
  if (options.cvType) {
    baseCSS += getCVTypeStyles(options.cvType);
  }
  // Add ATS optimizations if needed
  if (options.atsOptimized) {
    baseCSS += getATSStyles();
  }
  return baseCSS;
}
```

### PDF Generation Process
1. **Content Preparation**
   - Convert Markdown to HTML
   - Apply styling
   - Add sector-specific classes
2. **Page Configuration**
   - Set margins and paper size
   - Configure headers/footers
   - Handle page breaks
3. **PDF Rendering**
   - Launch headless browser
   - Render HTML content
   - Generate PDF file

## Usage Examples
### ATS-Friendly Generation
```typescript
const result = await generateATSFriendly({
  content: verifiedContent,
  template: 'standard',
  output: 'output/job-name/cv.pdf'
});
```
### Custom Format Generation
```typescript
const result = await generateCustomFormat({
  content: verifiedContent,
  template: customTemplate,
  styling: customStyling,
  output: 'output/job-name/cv-custom.pdf'
});
```
### Basic CV Generation
```typescript
await convertMarkdownToPdf(
  cvContent,
  'output/cv.pdf',
  {
    cvType: 'private',
    atsOptimized: true
  }
);
```
### Federal Application
```typescript
await convertMarkdownToPdf(
  cvContent,
  'output/federal-cv.pdf',
  {
    cvType: 'federal',
    atsOptimized: true,
    includeHeaderFooter: true,
    headerText: 'OFFICIAL FEDERAL RESUME'
  }
);
```

## Best Practices
1. **ATS Compatibility**
   - Always use semantic HTML
   - Maintain simple hierarchy
   - Include plain text alternatives
2. **Styling**
   - Use CSS variables for consistency
   - Keep sector-specific styles separate
   - Maintain print-friendly formatting
3. **Error Handling**
   - Validate input content
   - Handle missing styles gracefully
   - Provide meaningful error messages

## Future Improvements
1. **Enhanced ATS Testing**
   - Implement ATS simulation
   - Score generated PDFs
   - Suggest improvements
2. **Style Management**
   - Dynamic style loading
   - Custom theme support
   - Style version control
3. **Performance**
   - CSS optimization
   - Puppeteer pooling
   - Caching strategies

## Related Documentation
- [NAMING-CONVENTIONS.md](./NAMING-CONVENTIONS.md) - File naming standards
- [DATA-VERIFICATION.md](./DATA-VERIFICATION.md) - Content verification
