# AI Agent Technical Documentation

## Core Principles

1. **Data Verification**
   - All content MUST be verified against source data
   - No unverified claims or interpolation
   - Document all verification steps

2. **Document Generation Flow**
   ```mermaid
   graph TD
      A[Input] --> B{Document Type}
      B -->|CV| C[cv-parser.ts]
      B -->|Job Analysis| D[job-analyzer.ts]
      C --> E[Generator]
      D --> E
      E --> F[Output]
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

### Document Generation Process
1. Input Analysis
   - Parse CV using `cv-parser.ts`
   - Analyze job using `job-analyzer.ts`
   - Generate unified output using `generator.ts`

2. Output Formatting
   - Support for multiple formats
   - Customizable templates
   - ATS-friendly options

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
    format: string;
  };
}
```

## Tooling

### Core Tools
- `src/tools/cv-parser.ts`: CV parsing and analysis
- `src/tools/job-analyzer.ts`: Job posting analysis
- `src/tools/generator.ts`: Document generation

### CLI Integration
- `src/cli.ts`: Main CLI entry point
- `src/cli-unified.ts`: Unified command handling
- `src/cli-job-analyzer.ts`: Job analysis commands
- `src/cli-profile-importer.ts`: Profile import functionality

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
   - Support multiple output formats
   - Document custom format requirements
   - Validate accessibility
