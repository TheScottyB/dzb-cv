# {{personalInfo.name.full}}

## Contact Information
{{personalInfo.contact.email}} | {{personalInfo.contact.phone}}  
{{personalInfo.contact.address}}  
{{#if profiles.linkedIn}}{{#if profiles.linkedIn.url}}[LinkedIn Profile]({{profiles.linkedIn.url}}){{/if}}{{/if}}

## Professional Summary
{{professionalSummary}}

## Core Qualifications
{{#each relevantSkills}}
- {{this}}
{{/each}}

## Professional Experience in Healthcare
_(Listed in reverse chronological order)_

{{#each relevantExperience}}
### {{position}} | {{employer}}
*{{period}}*
{{#if address}}**Location:** {{address}}{{/if}}

**Core Responsibilities:**
{{#each duties}}
- {{this}}
{{/each}}

{{/each}}

## Technical Proficiencies
{{#each skills.technical}}
- {{this}}
{{/each}}

## Education & Certifications
{{#each education}}
### {{certification}}
{{#if institution}}**Institution:** {{institution}}{{/if}}
{{#if year}}**Year:** {{year}}{{/if}}
{{#if status}}**Status:** {{status}}{{/if}}
{{#if notes}}**Notes:** {{notes}}{{/if}}

{{/each}}

_References and additional information available upon request_ 