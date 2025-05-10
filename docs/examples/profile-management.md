---
path: docs/examples/management/profile-management.md
type: example
category: profiles
maintainer: system
last_updated: 2024-03-27
related_files:
  - docs/technical/profile-management.md
  - docs/user-guide/advanced-usage.md
---

# Profile Management Examples

## Profile Import

### From Markdown

```markdown
# Dawn Zurick Beilfuss
Software Engineering Leader | Chicago, IL
email@example.com | (123) 456-7890

## Professional Experience

### Senior Software Engineer | Current
Company Name
- Led development initiatives
- Managed team performance
- Implemented new technologies

### Technical Lead | 2018-2020
Previous Company
- Architected solutions
- Mentored junior developers
- Improved processes
```

```bash
# Import and validate markdown CV
dzb-cv profile import cv.md \
  --owner "Dawn Zurick Beilfuss" \
  --validate \
  --format markdown
```

### From JSON

```json
{
  "personalInfo": {
    "name": "Dawn Zurick Beilfuss",
    "title": "Software Engineering Leader",
    "location": "Chicago, IL",
    "email": "email@example.com",
    "phone": "(123) 456-7890"
  },
  "experience": [
    {
      "role": "Senior Software Engineer",
      "company": "Current Company",
      "period": "2020-Present",
      "achievements": [
        "Led development initiatives",
        "Managed team performance",
        "Implemented new technologies"
      ]
    }
  ]
}
```

```bash
# Import JSON profile
dzb-cv profile import profile.json \
  --validate \
  --format json
```

## Profile Export

### To Different Formats

```bash
# Export as PDF
dzb-cv profile export \
  --profile-id profile-123 \
  --format pdf \
  --output ./output/cv.pdf

# Export as Markdown
dzb-cv profile export \
  --profile-id profile-123 \
  --format markdown \
  --output ./output/cv.md
```

## Profile Validation

### Basic Validation

```bash
# Validate profile structure
dzb-cv profile validate cv.md --type basic
```

Example output:
```
✓ Personal information complete
✓ Contact details valid
✓ Experience entries properly formatted
✗ Missing education section
✗ Skills section recommended
```

### Federal Validation

```bash
# Validate against federal requirements
dzb-cv profile validate cv.md --type federal
```

Example output:
```
✓ Contact information complete
✓ Citizenship status included
✗ Missing salary information
✗ Supervisor contact details required
✗ Work hours not specified
```

## Profile Management

### Listing Profiles

```bash
# List all profiles
dzb-cv profile list

# List with details
dzb-cv profile list --verbose
```

Example output:
```
Available Profiles:
------------------
ID: profile-123
Owner: Dawn Zurick Beilfuss
Created: 2024-03-15
Updated: 2024-03-27
Versions: 3
------------------
```

### Version Management

```bash
# Export specific version
dzb-cv profile export \
  --profile-id profile-123 \
  --version 2 \
  --format pdf

# List version history
dzb-cv profile history profile-123
```

## Best Practices

1. **Data Validation**
   - Always validate on import
   - Check required fields
   - Verify format compliance

2. **Version Control**
   - Keep track of changes
   - Document updates
   - Maintain backups

3. **Format Consistency**
   - Use standard templates
   - Follow style guides
   - Maintain clean formatting 