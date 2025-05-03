# Academic CV Validation System

This folder contains a comprehensive validation system for academic CVs in PDF format. The validation system is designed to check CV content against various requirements, including academic rank, institution type, and field-specific expectations.

## Features

- Validates CVs against requirements for different academic ranks (assistant, associate, full professor)
- Tailors validation to different institution types (R1, R2, PUI, liberal arts)
- Validates specific sections (publications, research, teaching, service)
- Context-aware validation for special circumstances (COVID-19, research leave, administrative roles)
- Hierarchical validation with detailed error reporting
- Recommendations for CV improvement

## Usage Examples

### 1. Basic Validation for a Specific Rank

```typescript
// Basic validation for associate professor rank
const basicValidation = await academicTestHelpers.validateForRank(
  pdfDocument,
  cvSections,
  'associate' // or 'assistant' or 'full'
);

if (!basicValidation.isValid) {
  console.log('Validation errors:', basicValidation.errors);
}
```

### 2. Institution-Specific Validation

```typescript
// Validation for R1 institution, mid-career stage
const institutionValidation = await academicTestHelpers.validateForInstitutionType(
  pdfDocument,
  cvSections,
  'r1', // or 'r2', 'pui', 'liberal'
  'midCareer' // or 'earlyCareer', 'senior'
);

console.log('Validation summary:', institutionValidation.summary);
console.log('Validation details:', institutionValidation.details);
```

### 3. Comprehensive Validation with Context

```typescript
// Comprehensive validation with patterns and context
const comprehensiveValidation = await academicTestHelpers.validateComprehensive(
  pdfDocument,
  cvSections,
  {
    institutionType: 'r1',
    careerStage: 'midCareer',
    patterns: {
      nationalPresence: true,
      internationalCollaboration: true,
      interdisciplinary: true,
      studentMentorship: true
    },
    context: {
      administrativeRole: true
    }
  }
);

// Process validation results
if (!comprehensiveValidation.isValid) {
  console.log('Validation Summary:', comprehensiveValidation.summary);
  console.log('Recommendations:', comprehensiveValidation.recommendations);
  
  // Group issues by severity
  const criticalIssues = comprehensiveValidation.details
    .filter(d => d.status === 'fail')
    .map(d => d.message);
    
  const warnings = comprehensiveValidation.details
    .filter(d => d.status === 'warning')
    .map(d => d.message);
    
  console.log('Critical Issues:', criticalIssues);
  console.log('Warnings:', warnings);
}
```

### 4. Section-Specific Validation

```typescript
// Validate publication section
academicTestHelpers.expectValidPublicationSection(
  publicationSection,
  {
    format: 'apa',
    minPublications: 10,
    impactMetrics: {
      citations: 100,
      hIndex: 10
    }
  }
);

// Validate teaching metrics
academicTestHelpers.validateTeachingMetrics(
  teachingSection,
  {
    evaluationScore: 4.0,
    supervisedStudents: {
      phd: 2,
      masters: 5,
      undergraduate: 10
    }
  }
);
```

### 5. Handling Special Cases

```typescript
// Validate edge cases like COVID-19 impact
const edgeCaseValidation = await academicTestHelpers.validateEdgeCases(
  cvSections,
  {
    covid19Period: true,
    researchLeave: {
      duration: 1,
      year: 2023
    }
  }
);

// Validate specific patterns
const patternValidation = academicTestHelpers.validateCommonPatterns(
  cvSections,
  {
    nationalPresence: true,
    internationalCollaboration: true
  }
);
```

## Integration with PDF Processing

This validation system works with PDFs that have been processed to extract the sections and content. The typical workflow is:

1. Parse the PDF to extract text content
2. Identify sections and their hierarchy
3. Create SectionMetrics objects with the extracted content
4. Run validation against the sections
5. Present validation results to the user

## Customization

The validation rules can be customized by modifying:

- `getRankRequirements()` - For rank-specific requirements
- `getInstitutionRequirements()` - For institution-specific requirements
- Pattern detection regular expressions - For field-specific patterns

## Error Handling

The validation system provides detailed error messages with:

- Error type (content, format, structure, etc.)
- Field with the issue
- Expected value or format
- Actual value found
- Severity level (critical, major, minor)
- Suggested fix

This makes it easy to provide meaningful feedback to users about what needs to be improved in their CV.

## Best Practices

### 1. Validation Strategy

Choose the appropriate validation level based on your needs:

- Use `validateForRank` for quick checks against basic requirements
- Use `validateForInstitutionType` when targeting a specific institution
- Use `validateComprehensive` for full CV evaluation
- Use section-specific validators for focused improvements

### 2. Context Awareness

Always provide relevant context when available:

```typescript
const validation = await academicTestHelpers.validateComprehensive(
  pdfDocument,
  cvSections,
  {
    institutionType: 'r1',
    careerStage: 'midCareer',
    context: {
      // Adjust expectations for administrative roles
      administrativeRole: true,
      // Adjust for COVID-19 impact periods
      covid19Period: true,
      // Handle joint appointments
      jointAppointment: true
    }
  }
);
```

### 3. Progressive Validation

Implement validation in stages:

1. Start with basic structure validation
2. Progress to content-specific validation
3. Finally, apply context-specific validation

```typescript
// 1. Basic structure
academicTestHelpers.expectValidPDFStructure(cvSections);

// 2. Content-specific
for (const section of cvSections) {
  switch (section.title.text) {
    case 'Publications':
      await academicTestHelpers.expectValidPublicationSection(section, {
        format: 'apa',
        minPublications: 10
      });
      break;
    case 'Teaching':
      await academicTestHelpers.validateTeachingMetrics(section, {
        evaluationScore: 4.0
      });
      break;
    // ... other sections
  }
}

// 3. Context-specific
await academicTestHelpers.validateEdgeCases(cvSections, {
  covid19Period: true
});
```

### 4. Error Handling and Reporting

Group and prioritize validation errors:

```typescript
function processValidationResults(validation: ValidationReport) {
  // Group by severity
  const errors = {
    critical: [] as string[],
    major: [] as string[],
    minor: [] as string[]
  };

  validation.details.forEach(detail => {
    if (detail.status === 'fail') {
      const severity = detail.severity || 'major';
      errors[severity].push(detail.message);
    }
  });

  // Report critical issues first
  if (errors.critical.length > 0) {
    console.error('Critical Issues:', errors.critical);
  }

  // Then major issues
  if (errors.major.length > 0) {
    console.warn('Major Issues:', errors.major);
  }

  // Finally minor issues
  if (errors.minor.length > 0) {
    console.info('Suggestions:', errors.minor);
  }

  // Return recommendations
  return validation.recommendations;
}
```

## Common Use Cases

### 1. Tenure Track Validation

```typescript
const tenureValidation = await academicTestHelpers.validateComprehensive(
  pdfDocument,
  cvSections,
  {
    institutionType: 'r1',
    careerStage: 'midCareer',
    patterns: {
      nationalPresence: true,
      internationalCollaboration: true
    },
    customRequirements: {
      minPublications: 15,
      minCitations: 100,
      teachingLoad: 4
    }
  }
);
```

### 2. Annual Review

```typescript
const annualReview = async (previousYear: number) => {
  const yearlyMetrics = await academicTestHelpers.validateTeachingTrend(
    teachingSection,
    {
      minTrend: 0.1,  // Expect improvement
      recentScore: 4.0,
      minResponses: 20
    }
  );

  const publicationImpact = await academicTestHelpers.validatePublicationImpact(
    publicationSection,
    {
      citationsPerYear: 10,
      topVenuePapers: 1
    }
  );

  return { yearlyMetrics, publicationImpact };
};
```

### 3. Cross-Disciplinary Evaluation

```typescript
const crossDisciplinaryCheck = await academicTestHelpers.validateComprehensive(
  pdfDocument,
  cvSections,
  {
    institutionType: 'r1',
    careerStage: 'midCareer',
    patterns: {
      interdisciplinary: true
    },
    context: {
      jointAppointment: true
    },
    customRequirements: {
      // Adjust expectations for split appointment
      minPublications: 8,  // Instead of standard 15
      teachingLoad: 2     // Instead of standard 4
    }
  }
);
```

These examples demonstrate common scenarios where the validation system can be particularly useful. The system's flexibility allows it to handle various academic contexts while maintaining rigorous validation standards.
