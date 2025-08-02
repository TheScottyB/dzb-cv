---
path: docs/examples/README.md
type: index
category: examples
maintainer: system
last_updated: 2025-05-10
related_files:
  - docs/examples/ats-optimized-cv.md
  - docs/examples/federal-cv.md
  - docs/examples/profile-management.md
---

# DZB-CV Examples

This directory contains practical examples demonstrating various features and use cases of the DZB-CV system. Use these as references for best practices, template structure, and CLI usage.

## Table of Contents
- [ATS Optimized CV Example](ats-optimized-cv.md)
- [Federal CV Example](federal-cv.md)
- [Profile Management Example](profile-management.md)

## Example Categories

### ATS Optimization
- [ATS Optimized CV Example](ats-optimized-cv.md): Example of an ATS-friendly CV with best practices and code snippets.

### Federal CV
- [Federal CV Example](federal-cv.md): Example of a federal-style CV with required fields and formatting.

### Profile Management
- [Profile Management Example](profile-management.md): Example of profile import/export, validation, and version management.

## How to Use Examples
- Choose the relevant example for your use case (ATS, federal, management)
- Copy code snippets or templates as a starting point
- Adapt to your data and requirements
- Use current CLI commands (`cv create`) or AI generator scripts as shown
- For advanced features, refer to AI generator workflows

## Current System Examples

### CLI Usage Examples

```bash
# Basic CV creation
cv create --name "John Doe" --email "john@example.com"

# Single-page optimized CV
cv create --name "Jane Smith" --email "jane@company.com" --single-page --output "jane-optimized.pdf"

# Batch generation
for name in "Alice Johnson" "Bob Wilson"; do
  cv create --name "$name" --email "${name// /}@company.com" --single-page
done
```

### AI Generator Examples

```bash
# Sector-specific generation
node scripts/ai-generator.js --sector federal --name "Government Worker" --email "worker@agency.gov"

# Job-tailored CV
node scripts/ai-generator.js --job-file "job-description.txt" --name "Applicant Name" --email "applicant@example.com"

# Healthcare CV with simple generator
node scripts/simple-cv-generator.js healthcare "Dawn Zurick" "dawn@hospital.com"
```

### Integration Workflow Example

```bash
#!/bin/bash
# Complete application generation workflow
NAME="Professional Candidate"
EMAIL="candidate@example.com"

# Generate AI-optimized content
node scripts/ai-generator.js --sector private --name "$NAME" --email "$EMAIL" --output "ai-cv"

# Create optimized PDF
cv create --name "$NAME" --email "$EMAIL" --single-page --output "final-cv.pdf"

# Generate cover letter
node scripts/ai-generator.js --cover-letter --job-file "target-job.txt" --name "$NAME" --email "$EMAIL"
```

## Testing Examples
- All example tests should use the shared `test-utils.ts` for DRY sample data and helpers
- ESM-compatible mocking (`vi.mock` with `importActual`) should be used for robust, future-proof tests
- See the main repo `README.md` and `TESTING.md` for code examples and best practices

## Contributing Examples
To add new examples:
1. Place your example file in this folder
2. Include complete metadata header
3. Provide clear, tested code samples
4. Add comprehensive documentation
5. Update this README with a summary and link to your example

See [Contributing Guidelines](../../CONTRIBUTING.md) for detailed contribution instructions. 