# {{personalInfo.name.full}}

## Contact Information
{{personalInfo.contact.email}}  
{{personalInfo.contact.phone}}  
{{personalInfo.contact.address}}  

## Professional Summary
{{professionalSummary}}

## Professional Licenses & Certifications

### Regulatory Compliance
{{#each skills.certifications}}
- {{this}}
{{/each}}

### Professional Certifications
{{#each certifications}}
**{{name}}**  
{{#if issuer}}Issuing Organization: {{issuer}}{{/if}}  
{{#if dateObtained}}Date Obtained: {{formatUSDate dateObtained}}{{/if}}  
{{#if expirationDate}}Expiration Date: {{#if expirationDate}}{{formatUSDate expirationDate}}{{else}}No Expiration{{/if}}{{/if}}  
{{#if licenseNumber}}License/Certification Number: {{licenseNumber}}{{/if}}

{{/each}}

{{#if skills.realEstateCertifications}}
### Industry-Specific Certifications
{{#each skills.realEstateCertifications}}
- {{this}}
{{/each}}
{{/if}}

## Professional Experience
_(Listed in reverse chronological order)_

{{#sortByDate this}}
{{#each allExperience}}
### {{position}}
**{{employer}}** - {{#if address}}{{address}}{{/if}}
*{{formatUSDate startDate}} to {{#if endDate}}{{formatUSDate endDate}}{{else}}Present{{/if}}*
{{#if address}}**Location:** {{address}}{{/if}}  

{{#if industry}}
**Industry:** {{industry}}
{{/if}}

**Primary Responsibilities:**
{{#each duties}}
- {{this}}
{{/each}}

{{#if achievements}}
**Demonstrated Achievements:**
{{#each achievements}}
- {{this}}
{{/each}}
{{/if}}

{{#if training}}
**Professional Development:**
{{#each training}}
- {{this}}
{{/each}}
{{/if}}

{{/each}}
{{/sortByDate}}

## Professional Competencies

### Administrative Leadership
{{#each skills.managementAndLeadership}}
- {{this}}
{{/each}}

### Regulatory & Compliance
{{#each skills.realEstateOperations}}
- {{this}}
{{/each}}

### Technical & Systems Proficiency
{{#each skills.technical}}
- {{this}}
{{/each}}

## Public Service & Board Appointments
{{#each professionalAffiliations}}
### {{organization}}
{{#if roles}}
**Leadership Positions:**
{{#each roles}}
- {{this}}
{{/each}}
{{/if}}
{{#if activities}}
**Service Activities:**
{{#each activities}}
- {{this}}
{{/each}}
{{/if}}

{{/each}}

## Professional Development & Training
{{#each trainingAndCoaching}}
### {{role}} | {{organization}}
**Service Period:** {{formatUSDate startDate}} to {{#if endDate}}{{formatUSDate endDate}}{{else}}Present{{/if}}
**Hours Completed:** {{#if hours}}{{hours}}{{else}}40{{/if}}

**Program Focus:**
{{#each responsibilities}}
- {{this}}
{{/each}}

{{#if coursesCompleted}}
**Completed Training:**
{{#each coursesCompleted}}
- {{this}}
{{/each}}
{{/if}}

{{/each}}

## Community Service & Civic Engagement
{{#each volunteerWork}}
### {{organization}}
{{#if position}}**Service Role:** {{position}}{{/if}}
{{#if startDate}}**Period of Service:** {{formatUSDate startDate}} to {{#if endDate}}{{formatUSDate endDate}}{{else}}Present{{/if}}{{else}}{{#if year}}**Year of Service:** {{year}}{{/if}}{{/if}}

**Service Activities:**
{{#each activities}}
- {{this}}
{{/each}}

{{/each}}

---
*All information provided is accurate and complete to the best of my knowledge. Supporting documentation available upon request.*
Professional references available upon request

_Note: This template aligns with Illinois State Government application requirements_
