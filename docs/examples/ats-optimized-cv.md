---
path: docs/examples/cv-types/ats-optimized-cv.md
type: example
category: optimization
maintainer: system
last_updated: 2024-03-27
related_files:
  - docs/user-guide/advanced-usage.md
  - docs/reference/cli-commands.md
---

# ATS Optimization Examples

## Basic Usage

```typescript
import { createATSOptimizedPDF } from '../utils/ats/optimizer';

// Your CV content
const cvContent = `
Dawn Zurick Beilfuss
email@example.com | 123-456-7890
Chicago, IL

# Professional Experience
Company Name | 2020 - Present
Senior Role
- Led team initiatives
- Improved processes
`;

// PDF options
const options = {
  paperSize: 'Letter',
  margins: { top: 1, right: 1, bottom: 1, left: 1 },
  fontFamily: 'Arial, sans-serif',
  fontSize: 11,
  orientation: 'portrait'
};

// Generate optimized PDF
const result = await createATSOptimizedPDF(
  cvContent,
  'output/optimized-cv.pdf',
  options
);

console.log(`ATS Score: ${result.analysis.score}`);
console.log('Optimizations applied:', result.optimizations);
```

## Best Practices

1. **Section Headers**
   ```markdown
   # Professional Experience    ✅
   # Work History             ✅
   # My Journey              ❌
   ```

2. **Date Formats**
   ```markdown
   Company Name | 2020 - Present    ✅
   Company Name | 2020 - ongoing    ❌
   ```

3. **Contact Information**
   ```markdown
   Dawn Zurick Beilfuss
   email@example.com | 123-456-7890    ✅
   
   Dawn Zurick Beilfuss
   📧 email@example.com                ❌
   ```

4. **Bullet Points**
   ```markdown
   - Led team initiatives    ✅
   • Led team initiatives    ❌
   ★ Led team initiatives    ❌
   ```

## Integration with CV Generation

```typescript
// In your CV generation workflow
import { generateCV } from '../generator';
import { createATSOptimizedPDF } from '../utils/ats/optimizer';

async function generateOptimizedCV(data, options) {
  // First generate standard CV
  const cvContent = await generateCV(data);
  
  // Then create ATS-optimized version
  const result = await createATSOptimizedPDF(
    cvContent,
    'output/ats-optimized-cv.pdf',
    options
  );
  
  return result;
}
```
