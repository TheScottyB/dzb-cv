# Run Configuration Technical Documentation

## Purpose

Run configurations capture the complete context and decision-making process for each application, ensuring:
- Reproducibility
- Verification
- Process improvement

## Structure

```typescript
interface RunConfiguration {
  metadata: {
    date: string;
    position: {
      title: string;
      company: string;
      location: string;
      type: string;
    };
    source: {
      url: string;
      captured: string;
    };
  };
  
  analysis: {
    requirements: {
      required: string[];
      preferred: string[];
      responsibilities: string[];
    };
    matches: {
      experienceMatches: ExperienceMatch[];
      skillMatches: SkillMatch[];
    };
  };

  decisions: {
    formatChoices: {
      cv: PDFFormatDecision;
      coverLetter: PDFFormatDecision;
    };
    emphasisPoints: string[];
    verificationSteps: VerificationStep[];
  };

  outputs: {
    files: GeneratedFile[];
    verificationResults: VerificationResult[];
  };
}
```

## Example (Northwestern Medicine PSR)

```json
{
  "metadata": {
    "date": "2025-04-24",
    "position": {
      "title": "Patient Service Representative",
      "company": "Northwestern Medicine",
      "location": "Crystal Lake, IL",
      "type": "Part-time"
    }
  },
  "analysis": {
    "requirements": {
      "required": [
        "High school diploma",
        "0-2 years customer service"
      ],
      "preferred": [
        "Healthcare experience",
        "Medical terminology"
      ]
    },
    "matches": {
      "experienceMatches": [
        {
          "requirement": "Healthcare experience",
          "source": "Fox Lake Animal Hospital",
          "confidence": 0.9
        }
      ]
    }
  }
}
```

## Usage

1. **Creation**
   ```typescript
   const runConfig = await createRunConfig({
     jobUrl: url,
     sector: 'private',
     outputDir: 'output/nm-crystal-lake'
   });
   ```

2. **Verification**
   ```typescript
   const verified = await verifyRunConfig(runConfig);
   if (!verified.success) {
     console.error('Verification failed:', verified.errors);
   }
   ```

3. **Storage**
   ```typescript
   await storeRunConfig({
     config: runConfig,
     outputDir: 'runs',
     format: ['json', 'md']
   });
   ```

## Best Practices

1. **Documentation**
   - Include all decision points
   - Document verification steps
   - Note any manual overrides

2. **Verification**
   - Check all experience claims
   - Validate format decisions
   - Document confidence levels

3. **Storage**
   - Use consistent naming
   - Include job posting
   - Store in both JSON and MD
