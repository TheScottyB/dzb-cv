# Federal Resume Template

## Personal Information
- Full Name: {{full_name}}
- Email: {{email}}
- Phone: {{phone}}
- Location: {{location}}

## Citizenship and Security Clearance
- Citizenship Status: {{citizenship}}
- Security Clearance: {{clearance_level}}

## Work Experience
{{#each positions}}
### {{title}} at {{organization}}
**Location:** {{location}}
**Start Date:** {{start_date}} to {{end_date}}
**Hours per week:** {{hours_per_week}}
**Salary:** {{salary}}
**Supervisor:** {{supervisor_name}} ({{supervisor_phone}})
Contact Supervisor: {{ok_to_contact}}

**Duties, Accomplishments and Related Skills:**
{{description}}

{{/each}}

## Education
{{#each education}}
### {{degree}} in {{field}}
**Institution:** {{school}}
**Location:** {{location}}
**Graduation Date:** {{completion_date}}
**GPA:** {{gpa}}

{{/each}}

## Additional Information
- Veterans' Preference: {{veterans_preference}}
- Federal Civilian Status: {{federal_status}}

## References
Available upon request

_Note: This template follows USAJOBS format requirements_
