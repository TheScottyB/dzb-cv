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
  output: 'generated/cvs/applications/job-name/cv.pdf'
});
```
### Custom Format Generation
```typescript
const result = await generateCustomFormat({
  content: verifiedContent,
  template: customTemplate,
  styling: customStyling,
  output: 'generated/cvs/applications/job-name/cv-custom.pdf'
});
```
### Basic CV Generation
```typescript
await convertMarkdownToPdf(
  cvContent,
  'generated/cvs/personal/cv.pdf',
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
  'generated/cvs/personal/federal-cv.pdf',
  {
    cvType: 'federal',
    atsOptimized: true,
    includeHeaderFooter: true,
    headerText: 'OFFICIAL FEDERAL RESUME'
  }
);
```
### Single-Page Generation with Optimized Scaling

```typescript
// Basic single-page generation
await convertMarkdownToPdf(
  cvContent,
  'generated/cvs/personal/cv-single-page.pdf',
  {
    singlePage: true,
    scale: 0.85,           // Optimal scaling for content fit
    lineHeight: 1.15,      // Improved line spacing
    minFontSize: 10,       // Minimum readable font size
    margins: {
      top: 0.4,
      right: 0.4,
      bottom: 0.4,
      left: 0.4
    }
  }
);

// Advanced single-page with optimal parameters
await convertMarkdownToPdf(
  cvContent,
  'generated/cvs/personal/cv-optimized-single-page.pdf',
  {
    singlePage: true,
    scale: 0.82,           // Fine-tuned for maximum content
    lineHeight: 1.1,       // Compact but readable
    minFontSize: 9.5,      // Balance readability and space
    fontSizeAdjustment: -0.5, // Slightly smaller fonts
    margins: {
      top: 0.35,
      right: 0.35,
      bottom: 0.35,
      left: 0.35
    },
    optimizeForATS: true,  // ATS-friendly formatting
    compactSections: true  // Reduce section spacing
  }
);
```

### Single-Page Optimization Parameters

Optimal parameter combinations for different content densities:

#### Standard Content (2-3 pages → 1 page)
```typescript
const standardOptimization = {
  scale: 0.85,
  lineHeight: 1.15,
  minFontSize: 10,
  margins: { top: 0.4, right: 0.4, bottom: 0.4, left: 0.4 }
};
```

#### Dense Content (3-4 pages → 1 page)
```typescript
const denseOptimization = {
  scale: 0.82,
  lineHeight: 1.1,
  minFontSize: 9.5,
  fontSizeAdjustment: -0.5,
  margins: { top: 0.35, right: 0.35, bottom: 0.35, left: 0.35 },
  compactSections: true
};
```

#### Maximum Compression (4+ pages → 1 page)
```typescript
const maxCompression = {
  scale: 0.78,
  lineHeight: 1.05,
  minFontSize: 9,
  fontSizeAdjustment: -1,
  margins: { top: 0.3, right: 0.3, bottom: 0.3, left: 0.3 },
  compactSections: true,
  reduceWhitespace: true
};
```

#### CLI Integration Parameters
The CLI `--single-page` flag uses optimized defaults:
```typescript
const cliDefaults = {
  scale: 0.85,        // Good balance of readability and compression
  lineHeight: 1.15,   // Maintains readability
  minFontSize: 10,    // Professional minimum
  margins: { top: 0.4, right: 0.4, bottom: 0.4, left: 0.4 }
};
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
3. **Single-Page Optimization**
   - Test readability at different scale factors
   - Maintain minimum font sizes for accessibility
   - Balance content compression with visual clarity
   - Use appropriate margins for print compatibility
4. **Error Handling**
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
