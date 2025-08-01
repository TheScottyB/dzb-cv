---
path: docs/user-guide/advanced-usage.md
type: user
category: guide
maintainer: system
last_updated: 2024-03-27
related_files:
  - docs/user-guide/getting-started.md
  - docs/reference/cli-commands.md
---

# Advanced Usage Guide

## Customizing Your CV

### Updating Personal Information

Edit `src/data/base-info.json` to update:
- Personal details (name, contact info)
- Work experience
- Education history
- Skills and qualifications

### Customizing Templates

Each sector has its own template file in `src/shared/templates/{sector}/{sector}-template.md`

Templates use Handlebars syntax:
- Variable substitution: `{{variable}}`
- Loops: `{{#each items}}...{{/each}}`
- Conditionals: `{{#if condition}}...{{/if}}`

## Advanced Features

### Advanced Job Analysis and Optimization

Leverage the full functionality of the ATS system for in-depth job analysis and CV optimization.

#### 1. Analyzing Job Descriptions
```bash
# Analyze a local job description with extended options
cv analyze job-description.txt --file --output ./full-analysis.json --format detailed

# Analyze online job posting with comprehensive content retrieval
cv analyze <job-posting-url> --output ./full-analysis.json --format detailed --save-raw-content
```

#### 2. Utilizing Custom Skills and Scoring
Create a sophisticated analysis by incorporating industry-specific skills and customizing scoring weights.

```typescript
import { createATSEngine, SkillDefinition, SkillCategory } from '@dzb-cv/ats';

const IndustrySpecificSkills: SkillDefinition[] = [
  {
    name: 'Data Science',
    aliases: ['DS', 'Big Data Analysis'],
    category: SkillCategory.Programming,
    related: ['Python', 'R', 'SQL']
  }
];

const atsEngine = createATSEngine({
  skills: [...IndustrySpecificSkills],
  scoring: {
    keywordWeight: 0.2,
    skillsWeight: 0.4,
    experienceWeight: 0.3,
    educationWeight: 0.1
  },
  minimumScore: 0.75
});

const analysis = await atsEngine.analyze(cvData, jobPosting);
console.log(`Custom Analysis Score: ${analysis.score}`);
```

#### 3. Tailoring CV Suggestions for Optimization
```typescript
const generateSuggestions = (analysis) => {
  console.log('Optimize your CV with these suggestions:');
  analysis.suggestions.forEach(suggestion => console.log(`- ${suggestion}`));
};

// Execute
generateSuggestions(analysis);
```

#### 4. Batch Processing
Automate ATS tasks for multiple job descriptions.

```bash
#!/bin/bash
# Batch analyze multiple job descriptions
for file in ./job-descriptions/*.txt; do
  echo "Analyzing $file..."
  cv analyze "$file" --output "./analysis/$(basename "$file" .txt)-analysis.json"
done
```

### Advanced Generation Options

```bash
# Generate with custom format and output
dzb-cv generate federal --format markdown --output ./my-output --filename my-cv

# Analyze with detailed options
dzb-cv analyze <job-posting-url> \
  --output ./analysis.json \
  --format json \
  --save-raw-content
```

## CV Format Details

### Federal CV Format
- Detailed work history with specific dates and hours
- Salary information and supervisor contacts
- Citizenship and security clearance information
- USAJOBS compliance features

### State CV Format
- State-specific formatting requirements
- Detailed experience relevant to state positions
- Required certifications and education details
- State-specific compliance features

### Private Sector CV Format
- Concise, achievement-focused format
- Emphasis on relevant skills and qualifications
- Optimized for applicant tracking systems
- Industry-specific customizations

## Profile Management

### Import/Export
```bash
# Import existing CV
dzb-cv profile import my-cv.md --validate

# Export in different formats
dzb-cv profile export --format pdf
dzb-cv profile export --format markdown
```

### Validation
```bash
# Validate against different requirements
dzb-cv profile validate my-cv.md --type federal
dzb-cv profile validate my-cv.md --type strict
```

## Template Customization

### Creating Custom Templates
1. Copy an existing template from `src/shared/templates`
2. Modify the template using Handlebars syntax
3. Add custom sections and styling
4. Test with sample data

### Template Variables
Common variables available in templates:
- `{{personalInfo}}` - Contact and basic information
- `{{experience}}` - Work history
- `{{education}}` - Educational background
- `{{skills}}` - Skills and competencies
- `{{certifications}}` - Professional certifications

## Best Practices

1. **Data Organization**
   - Keep base info up to date
   - Use consistent formatting
   - Maintain separate profiles for different sectors

2. **Template Management**
   - Document custom templates
   - Test with various data sets
   - Keep backups of working templates

3. **Version Control**
   - Track changes to templates
   - Maintain profile versions
   - Document major updates 