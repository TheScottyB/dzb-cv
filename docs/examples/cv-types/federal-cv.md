---
path: docs/examples/cv-types/federal-cv.md
type: example
category: cv-generation
maintainer: system
last_updated: 2024-03-27
related_files:
  - docs/examples/cv-types/ats-optimized-cv.md
  - docs/user-guide/advanced-usage.md
---

# Federal CV Example

## Basic Structure

```markdown
# Dawn Zurick Beilfuss
Chicago, IL | email@example.com | (123) 456-7890
U.S. Citizen | Security Clearance: Secret

## Professional Experience

### Senior Software Engineer
Department of Defense | GS-13 | 40 hrs/week
January 2020 - Present | Salary: $120,000/year
Supervisor: John Smith (may contact)

- Led development of mission-critical systems using TypeScript and Node.js
- Managed team of 5 engineers across 3 time zones
- Implemented security protocols meeting NIST standards
- Reduced system downtime by 45% through automated monitoring

### Technical Lead
Department of Energy | GS-12 | 40 hrs/week
March 2018 - December 2019 | Salary: $95,000/year
Supervisor: Jane Doe (may contact)

- Architected cloud-based data processing pipeline
- Supervised implementation of security compliance measures
- Coordinated with multiple agencies for system integration
```

## Generation Command

```bash
# Generate federal CV with all required fields
dzb-cv generate federal \
  --format pdf \
  --output ./usajobs \
  --include-salary \
  --include-hours \
  --include-supervisors
```

## Template Customization

```handlebars
{{#*inline "federal-experience"}}
  {{#each experience}}
    ### {{position}}
    {{department}} | {{grade}} | {{hours}} hrs/week
    {{startDate}} - {{endDate}} | Salary: ${{salary}}/year
    Supervisor: {{supervisor.name}} ({{supervisor.contactPermission}})

    {{#each achievements}}
    - {{this}}
    {{/each}}
  {{/each}}
{{/inline}}

{{> header}}
{{> federal-experience}}
{{> education}}
{{> certifications}}
```

## Required Fields

```json
{
  "personalInfo": {
    "name": "Dawn Zurick Beilfuss",
    "location": "Chicago, IL",
    "email": "email@example.com",
    "phone": "(123) 456-7890",
    "citizenship": "U.S. Citizen",
    "clearance": "Secret"
  },
  "experience": [
    {
      "position": "Senior Software Engineer",
      "department": "Department of Defense",
      "grade": "GS-13",
      "hours": 40,
      "startDate": "January 2020",
      "endDate": "Present",
      "salary": 120000,
      "supervisor": {
        "name": "John Smith",
        "contactPermission": "may contact"
      },
      "achievements": [
        "Led development of mission-critical systems using TypeScript and Node.js",
        "Managed team of 5 engineers across 3 time zones",
        "Implemented security protocols meeting NIST standards",
        "Reduced system downtime by 45% through automated monitoring"
      ]
    }
  ]
}
```

## Best Practices

1. **Required Information**
   - Include all contact information
   - Provide detailed work history
   - List specific hours and salary
   - Include supervisor information

2. **Formatting**
   - Use clear section headers
   - Include specific dates
   - List accomplishments with metrics
   - Follow USAJOBS guidelines

3. **Content Tips**
   - Be specific about responsibilities
   - Include measurable achievements
   - List relevant security clearances
   - Mention federal grade levels 