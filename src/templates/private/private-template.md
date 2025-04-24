# {{personalInfo.name.full}}

## Contact Information
{{personalInfo.contact.email}} | {{personalInfo.contact.phone}}  
{{personalInfo.contact.address}}  
{{#if profiles.linkedIn}}[LinkedIn Profile]({{profiles.linkedIn}}){{/if}}

## Professional Summary
{{professionalSummary}}

## Core Qualifications
{{#each cvTypes.private.highlights}}
- {{this}}
{{/each}}

## Professional Certifications & Licenses

### Industry Certifications
{{#each certifications}}
**{{name}}**  
{{#if issuer}}Issuing Organization: {{issuer}}{{/if}}  
{{#if dateObtained}}Date Obtained: {{formatUSDate dateObtained}}{{/if}}  
{{#if expirationDate}}Expiration Date: {{#if expirationDate}}{{formatUSDate expirationDate}}{{else}}No Expiration{{/if}}{{/if}}  
{{#if licenseNumber}}License/Certification Number: {{licenseNumber}}{{/if}}

{{/each}}

### Specialized Credentials
{{#each skills.realEstateCertifications}}
- {{this}}
{{/each}}

## Professional Experience
_(Listed in reverse chronological order)_

{{#sortByDate workExperience}}
{{#each this}}
### {{position}} | {{employer}}
*{{formatUSDate startDate}} to {{#if endDate}}{{formatUSDate endDate}}{{else}}Present{{/if}}*
{{#if address}}**Location:** {{address}}{{/if}}

{{#if isLeadership}}
**Strategic Responsibilities:**
{{#each duties}}
- {{this}}
{{/each}}

{{#if achievements}}
**Key Achievements:**
{{#each achievements}}
- {{this}}
{{/each}}
{{/if}}
{{else}}
**Core Responsibilities:**
{{#each duties}}
- {{this}}
{{/each}}

{{#if achievements}}
**Notable Achievements:**
{{#each achievements}}
- {{this}}
{{/each}}
{{/if}}
{{/if}}

{{/each}}
{{/sortByDate}}

## Areas of Expertise

### Real Estate Operations & Management
{{#each skills.realEstateOperations}}
- {{this}}
{{/each}}

### Leadership & Strategy
{{#each skills.managementAndLeadership}}
- {{this}}
{{/each}}

### Technical Proficiencies
{{#each skills.technical}}
- {{this}}
{{/each}}

## Industry Leadership & Board Service
{{#each professionalAffiliations}}
### {{organization}}
{{#if startDate}}**Period of Service:** {{formatUSDate startDate}} to {{#if endDate}}{{formatUSDate endDate}}{{else}}Present{{/if}}{{/if}}

{{#if roles}}
**Leadership Positions:**
{{#each roles}}
- {{this}}
{{/each}}
{{/if}}

{{#if activities}}
**Activities and Contributions:**
{{#each activities}}
- {{this}}
{{/each}}
{{/if}}
{{/each}}

## Recognition & Awards
{{#each awards}}
- **{{title}} - {{organization}}:** {{#if achievement}}{{achievement}}{{/if}}{{#if startDate}} ({{formatUSDate startDate}}{{#if endDate}} to {{formatUSDate endDate}}{{/if}}){{/if}}
{{/each}}

## Professional Development
_(Listed in reverse chronological order)_

{{#each trainingAndCoaching}}
### {{role}} | {{organization}}
*{{formatUSDate startDate}} to {{#if endDate}}{{formatUSDate endDate}}{{else}}Present{{/if}}*
{{#if responsibilities}}
**Program Focus:**
{{#each responsibilities}}
- {{this}}
{{/each}}
{{/if}}

{{#if coursesCompleted}}
**Advanced Training:**
{{#each coursesCompleted}}
- {{this}}
{{/each}}
{{/if}}
{{/each}}
_References and additional information available upon request_
