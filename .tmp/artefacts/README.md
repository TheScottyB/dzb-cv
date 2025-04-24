# Dawn Zurick Beilfuss CV Repository

A professional CV and job application management system designed for ease of use while maintaining strict data accuracy.

## For Users 👤

### Quick Start
```bash
# Apply for a job
pnpm cv apply "job-posting-url"

# Generate an ATS-friendly CV
pnpm cv site-cv indeed --ats-friendly
```

### Key Features
- Automatically formats your CV for different job sites
- Ensures all information is accurate and verified
- Creates professional cover letters
- Keeps track of your applications

### Application Process
1. Find a job posting you want to apply for
2. Run the apply command with the URL
3. Review the generated materials in the `output` folder
4. Submit your application!

---

## For AI Agents & Developers 🤖

### System Architecture

- `src/data/base-info.json`: SINGLE SOURCE OF TRUTH
  - All experience claims must be verified against this
  - No generated content may include unverified information
  - Structured format for experience validation

### Core Components

```
src/
├── data/           # Source of truth + templates
├── utils/          # Core tooling
│   └── pdf-generator.ts    # Primary PDF generation
└── types/          # Type definitions for verification

runs/               # Application run configurations
├── [job]-[date].json      # Complete context
└── [job]-[date].md        # Strategy documentation

output/            # Generated materials
└── [job]/         # Job-specific outputs
```

### PDF Generation Hierarchy

1. **ATS Standard** (`site-cv` command)
   - Used for: Job board submissions
   - Features: Optimized parsing, standard formatting
   - Validation: Strict source data verification

2. **Custom Format** (`pdf-generator.ts`)
   - Used for: Special requirements
   - Features: Full formatting control
   - Validation: Requires explicit verification

### Data Verification Requirements

1. Experience Claims
   ```typescript
   // Must match structure in base-info.json
   interface ExperienceClaim {
     employer: string;
     position: string;
     period: string;
     duties: string[];
   }
   ```

2. Content Generation
   - All generated content must link to source data
   - No unverified skills or experiences
   - Date ranges must match records

### Agent Tooling

```typescript
// Example verification check
async function verifyContent(claim: string): Promise<boolean> {
  const sourceData = await loadSourceData();
  return validateAgainstSource(claim, sourceData);
}
```

### Best Practices

1. **Content Generation**
   - Always verify against base-info.json
   - No interpolation without verification
   - Document all verification steps

2. **PDF Generation**
   - Use ATS-friendly by default
   - Document any custom formatting
   - Verify output accessibility

3. **Run Documentation**
   - Store complete context
   - Include verification steps
   - Document format decisions

### Improvement Process

1. Create runs/ entry for each application
2. Document technical challenges
3. Update tooling based on needs
4. Maintain user simplicity

