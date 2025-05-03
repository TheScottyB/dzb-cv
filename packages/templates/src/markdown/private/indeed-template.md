# {{personalInfo.name.full}}

## Contact Information
{{personalInfo.contact.email}} | {{personalInfo.contact.phone}}  
{{personalInfo.contact.address}}  
{{#if profiles.linkedIn}}LinkedIn: {{profiles.linkedIn}}{{/if}}

## Professional Summary
{{professionalSummary}}

## Core Competencies
{{#each cvTypes.private.highlights}}
- {{this}}
{{/each}}

## Technical Skills
{{#each skills.technical}}
- {{this}}
{{/each}}

## Industry Expertise
{{#each skills.realEstateOperations}}
- {{this}}
{{/each}}

## Professional Certifications
{{#each certifications}}
**{{name}}** - {{#if issuer}}{{issuer}}{{/if}}{{#if dateObtained}} - Obtained: {{formatUSDate dateObtained}}{{/if}}
{{/each}}

{{#if skills.realEstateCertifications}}
{{#each skills.realEstateCertifications}}
- {{this}}
{{/each}}
{{/if}}

## Professional Experience
{{#sortByDate this}}
### {{position}}
**{{employer}}** - {{#if address}}{{address}}{{/if}} - {{formatUSDate startDate}} to {{#if endDate}}{{formatUSDate endDate}}{{else}}Present{{/if}}

{{#each duties}}
- {{this}}
{{/each}}

{{#if achievements}}
{{#each achievements}}
- {{this}}
{{/each}}
{{/if}}

{{/sortByDate}}

## Leadership & Management
{{#each skills.managementAndLeadership}}
- {{this}}
{{/each}}

## Education
{{#each education}}
**{{certification}}** - {{#if institution}}{{institution}}{{/if}}{{#if year}} - {{year}}{{/if}}
{{/each}}

## Professional Development
{{#each trainingAndCoaching}}
**{{role}}** - {{organization}} - {{formatUSDate startDate}}{{#if endDate}} to {{formatUSDate endDate}}{{/if}}
{{#if hours}}Hours: {{hours}}{{/if}}
{{#if coursesCompleted}}
{{#each coursesCompleted}}
- {{this}}
{{/each}}
{{/if}}
{{/each}}

## Professional Affiliations
{{#each professionalAffiliations}}
**{{organization}}**
{{#if roles}}
{{#each roles}}
- {{this}}
{{/each}}
{{/if}}
{{/each}}

## Awards & Recognition
{{#each awards}}
**{{title}}** - {{organization}}{{#if startDate}} - {{formatUSDate startDate}}{{/if}}
{{/each}}

_References available upon request_

