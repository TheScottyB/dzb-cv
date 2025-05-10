---
path: docs/technical/NAMING-CONVENTIONS.md
type: technical
category: conventions
maintainer: system
last_updated: 2025-05-10
---

# Naming Conventions Technical Documentation

## Table of Contents
- [Overview](#overview)
- [Filename Structure](#filename-structure)
- [Examples](#examples)
- [Implementation](#implementation)
- [Best Practices](#best-practices)

## Overview

Standardized naming is crucial for:
- File organization
- Application tracking
- System automation

## Filename Structure

### Basic Pattern
```typescript
interface FilenameParts {
  prefix: 'dawn';  // Standard prefix
  employer: string;  // Shortened employer name
  position: string;  // Concise position title
  type: 'cv' | 'cover' | 'summary';  // Document type
  ext: 'md' | 'pdf' | 'json';  // File extension
}

// Example: dawn-nm-psr-cv.pdf
```

### Company Name Shortening
```typescript
const companyShortNames = {
  'Northwestern Medicine': 'nm',
  'State of Illinois': 'il',
  // Add more as needed
};

function shortenCompanyName(company: string): string {
  return companyShortNames[company] || 
         company.toLowerCase()
               .replace(/[^a-z0-9]+/g, '-')
               .slice(0, 10);
}
```

### Position Title Shortening
```typescript
function shortenPosition(title: string): string {
  // Remove common suffixes
  const cleaned = title
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s*-.*$/, '')
    .replace(/\s*\$.*$/, '');

  // Create acronym for long titles
  if (cleaned.length > 20) {
    return cleaned
      .split(/\s+/)
      .map(word => word[0])
      .join('')
      .toLowerCase();
  }

  return cleaned
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 20);
}
```

## Examples

### Northwestern Medicine PSR Application
```plaintext
dawn-nm-psr-cv.pdf
dawn-nm-psr-cover.pdf
dawn-nm-psr-cv.md
dawn-nm-psr-cover.md
```

### Run Configuration
```plaintext
runs/nm-psr-20250424.json
runs/nm-psr-20250424.md
```

### Job Posting
```plaintext
job-postings/nm-psr-20250424.html
```

## Implementation

1. **Filename Generation**
   ```typescript
   function generateFilename(
     company: string,
     position: string,
     type: string,
     ext: string
   ): string {
     const shortCompany = shortenCompanyName(company);
     const shortPosition = shortenPosition(position);
     return `dawn-${shortCompany}-${shortPosition}-${type}.${ext}`;
   }
   ```

2. **Run Configuration Names**
   ```typescript
   function generateRunConfigName(
     company: string,
     position: string,
     date: Date
   ): string {
     const shortCompany = shortenCompanyName(company);
     const shortPosition = shortenPosition(position);
     const dateStr = date.toISOString().slice(0,10).replace(/-/g, '');
     return `${shortCompany}-${shortPosition}-${dateStr}`;
   }
   ```

## Best Practices

1. **Consistency**
   - Always use lowercase
   - Use hyphens as separators
   - Keep names concise but meaningful

2. **Documentation**
   - Document any new shorthand names
   - Maintain company name mappings
   - Update examples as needed

3. **Validation**
   - Check for filename collisions
   - Verify file extensions
   - Ensure consistent structure
