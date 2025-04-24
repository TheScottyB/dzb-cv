# AI Agent Technical Documentation

## Core Principles

1. **Data Verification**
   - All content MUST be verified against `src/data/base-info.json`
   - No unverified claims or interpolation
   - Document all verification steps

2. **PDF Generation Hierarchy**
   ```mermaid
   graph TD
      A[Input] --> B{Format Type}
      B -->|Standard| C[site-cv Command]
      B -->|Custom| D[pdf-generator.ts]
      C --> E[ATS Friendly]
      D --> F[Custom Format]
   ```

3. **Run Configuration Requirements**
   - Store complete context
   - Include job posting
   - Document format decisions

## Implementation Details

### Source Data Validation
```typescript
interface VerifiedClaim {
  content: string;
  sourceReference: {
    file: string;
    path: string[];
    context: string;
  };
}
```

### PDF Generation Decision Tree
1. ATS Requirements?
   - Yes → Use `site-cv` command
   - No → Check custom requirements

2. Custom Formatting?
   - Yes → Use `pdf-generator.ts`
   - No → Default to ATS-friendly

### Run Configuration Schema
```typescript
interface RunConfiguration {
  jobPosting: {
    url: string;
    content: string;
    timestamp: string;
  };
  verification: {
    claims: VerifiedClaim[];
    sourceData: string;
  };
  outputs: {
    cv: string;
    coverLetter: string;
    format: 'ATS' | 'Custom';
  };
}
```

## Tooling

### PDF Generation
- `src/utils/pdf-generator.ts`: Core implementation
- `cli/commands/site-cv.ts`: ATS-friendly wrapper
- `utils/generate-*.js`: Custom generators

### Verification Tools
- `src/utils/verify-claims.ts`: Claim verification
- `src/utils/source-validator.ts`: Source data validation
- `src/utils/run-logger.ts`: Run configuration logging

## Best Practices

1. **Content Generation**
   - Always verify against source data
   - Document verification steps
   - Log all decisions

2. **Run Documentation**
   - Create complete run configurations
   - Store job posting content
   - Document format decisions

3. **Format Selection**
   - Default to ATS-friendly
   - Document custom format requirements
   - Validate accessibility
