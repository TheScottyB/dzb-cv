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

### Job Analysis and Tailoring (Beta)

The job analysis feature is currently in development with basic functionality:

1. Analyze a local job description file:
   ```bash
   dzb-cv analyze job-description.txt --file --output ./analysis.json
   ```

2. Basic URL content retrieval:
   ```bash
   dzb-cv analyze <job-posting-url> --save-raw-content
   ```

Current Capabilities:
- Basic text parsing of job descriptions
- Simple keyword extraction
- File-based analysis
- Raw content saving

Note: Full ATS optimization and detailed job analysis features are under development.

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