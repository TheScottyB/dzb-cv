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

### Current CLI Capabilities

The DZB-CV CLI currently supports basic CV creation with the `cv create` command. For advanced features like job analysis, ATS optimization, and sector-specific generation, use the AI generator scripts described below.

#### Single-Page Optimization

```bash
# Create optimized single-page CV
cv create --name "John Doe" --email "john@example.com" --single-page --output "optimized-cv.pdf"

# Standard multi-page CV
cv create --name "Jane Smith" --email "jane@company.com" --output "standard-cv.pdf"
```

#### Batch CV Generation

```bash
#!/bin/bash
# Generate multiple CVs with different options
NAMES=("Alice Johnson" "Bob Smith" "Carol Davis")
EMAILS=("alice@company.com" "bob@startup.io" "carol@nonprofit.org")

for i in "${!NAMES[@]}"; do
  name="${NAMES[$i]}"
  email="${EMAILS[$i]}"
  filename="${name// /-}-cv.pdf"
  
  echo "Generating CV for $name..."
  cv create --name "$name" --email "$email" --single-page --output "$filename"
done
```

### AI Generator Integration

For advanced CV generation features beyond the basic CLI, use the AI generator scripts:

#### Sector-Specific CV Generation

```bash
# Generate federal CV with comprehensive formatting
node scripts/ai-generator.js --sector federal --name "John Doe" --email "john@example.com" --output "federal-cv"

# Generate private sector CV optimized for tech industry
node scripts/ai-generator.js --sector private --industry tech --name "Jane Smith" --email "jane@company.com"

# Generate state government CV
node scripts/ai-generator.js --sector state --name "Alex Johnson" --email "alex@state.gov"

# Healthcare sector CV with specialized templates
node scripts/simple-cv-generator.js healthcare "Dawn Zurick" "dawn@example.com"
```

#### Job-Tailored CV Generation

```bash
# Generate CV tailored to specific job posting URL
node scripts/ai-generator.js --job-url "https://example.com/job-posting" --name "Sarah Chen" --email "sarah@example.com"

# Generate CV from local job description file
node scripts/ai-generator.js --job-file "./job-descriptions/senior-developer.txt" --name "Michael Brown" --email "michael@example.com"

# Batch process multiple job applications
node scripts/ai-generator.js --job-batch "./job-descriptions/" --name "Lisa Wang" --email "lisa@example.com"
```

#### Advanced Workflow Integration

```bash
#!/bin/bash
# Complete AI-powered CV generation workflow

NAME="John Professional"
EMAIL="john@example.com"
SECTOR="private"
JOB_FILE="./target-job.txt"

# Step 1: Generate job-tailored CV content with AI
echo "Generating AI-optimized CV content..."
node scripts/ai-generator.js \
  --sector "$SECTOR" \
  --job-file "$JOB_FILE" \
  --name "$NAME" \
  --email "$EMAIL" \
  --output "temp-ai-cv"

# Step 2: Generate optimized single-page PDF with CLI
echo "Creating optimized PDF..."
cv create \
  --name "$NAME" \
  --email "$EMAIL" \
  --single-page \
  --output "$NAME-optimized-cv.pdf"

# Step 3: Generate cover letter
echo "Generating cover letter..."
node scripts/ai-generator.js \
  --cover-letter \
  --job-file "$JOB_FILE" \
  --name "$NAME" \
  --email "$EMAIL" \
  --output "cover-letter"

echo "Complete application package generated!"
```

#### Specialized Templates and Customization

```bash
# Generate CV with custom template modifications
node scripts/ai-generator.js \
  --sector federal \
  --template-override "./custom-templates/usajobs-enhanced.md" \
  --name "Government Candidate" \
  --email "candidate@example.com"

# Generate multiple format outputs
node scripts/ai-generator.js \
  --sector private \
  --name "Multi Format" \
  --email "multi@example.com" \
  --formats "pdf,markdown,docx"

# Generate with ATS optimization focus
node scripts/ai-generator.js \
  --sector private \
  --ats-optimize \
  --keywords-file "./target-keywords.txt" \
  --name "ATS Optimized" \
  --email "ats@example.com"
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

Profile management is currently handled through direct file editing and the AI generator workflows. Future CLI releases will include dedicated profile management commands.

### Current Approach
- Edit base data files directly in `src/data/`
- Use AI generator for sector-specific profiles
- Version control with Git for profile history
- Manual validation through test generation

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