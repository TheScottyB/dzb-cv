# Component Technical Documentation

## Core Components Requiring Documentation

### 1. Job Analysis (`src/utils/job-analyzer.ts`)
- Currently has issues with company name extraction
- Needs better domain-specific handling (e.g., nm.org)
- Important for accurate application generation

### 2. Run Configuration (`src/types/run-config.ts`)
- Critical for application reproducibility
- Stores application strategy
- Captures job context

### 3. Filename Generation
- Currently producing overly long filenames
- Need standardization rules
- Important for organization

### 4. Data Verification System
- Core to preventing incorrect claims
- Needs clear documentation for agents

Suggested Technical Doc Structure:
```
docs/technical/
├── PDF-GENERATION.md (existing)
├── JOB-ANALYSIS.md (needed)
├── RUN-CONFIG.md (needed)
├── NAMING-CONVENTIONS.md (needed)
└── DATA-VERIFICATION.md (needed)
```

Would you like me to create any of these additional technical documentation files based on our experience with the Northwestern Medicine application?
