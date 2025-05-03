# {{personalInfo.name.full}}

## Personal Information
**Email:** {{personalInfo.contact.email}}  
**Phone:** {{personalInfo.contact.phone}}  
**Address:** {{personalInfo.contact.address}}  
**Citizenship Status:** {{personalInfo.citizenship}}

## Professional Summary
{{professionalSummary}}

## Work Experience
_(Listed in reverse chronological order as required by USAJOBS)_

{{#sortByDate this}}
{{#each allExperience}}
### {{position}}
**Employer:** {{employer}}
{{#if address}}**Location:** {{address}}{{/if}}

**Period of Employment:** {{formatUSDate startDate}} to {{#if endDate}}{{formatUSDate endDate}}{{else}}Present{{/if}}
**Hours per Week:** {{#if hoursPerWeek}}{{hoursPerWeek}}{{else}}40{{/if}} hrs/wk

**Federal Pay Grade Equivalent:** GS-{{calculateGradeLevel position}}
**Salary:** {{#if salary}}{{formatSalary salary}}{{else}}Available upon request{{/if}}
**Supervisor:** {{#if supervisor}}{{supervisor}}{{else}}Available upon request{{/if}}
**Working Conditions:** {{#if workConditions}}{{workConditions}}{{else}}Professional office environment{{/if}}

**Key Responsibilities and Achievements:**
{{#each duties}}
- {{this}}
{{/each}}

{{#if achievements}}
**Notable Achievements:**
{{#each achievements}}
- {{this}}
{{/each}}
{{/if}}

{{/each}}
{{/sortByDate}}

## Education, Training, and Development
_(Listed in reverse chronological order)_

### Formal Education
{{#each education}}
**{{certification}}**  
{{#if institution}}Institution: {{institution}}{{/if}}  
{{#if year}}Year Completed: {{year}}{{/if}}  
{{#if status}}Current Status: {{status}}{{/if}}  
{{#if notes}}Additional Information: {{notes}}{{/if}}

{{/each}}

### Certifications
{{#each certifications}}
**{{name}}**  
{{#if issuer}}Issuing Organization: {{issuer}}{{/if}}  
{{#if dateObtained}}Date Obtained: {{formatUSDate dateObtained}}{{/if}}  
{{#if expirationDate}}Expiration Date: {{#if expirationDate}}{{formatUSDate expirationDate}}{{else}}No Expiration{{/if}}{{/if}}  
{{#if licenseNumber}}License/Certification Number: {{licenseNumber}}{{/if}}

{{/each}}

### Professional Training
{{#each trainingAndCoaching}}
**{{role}} - {{organization}}**  
**Period:** {{#if startDate}}{{formatFederalDateRange startDate endDate}}{{else}}{{formatFederalDateRange period "Present"}}{{/if}}
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

## Job-Related Skills and Competencies

### Healthcare Administration
{{#each skills.healthcareAdministration}}
- {{this}}
{{/each}}

### Leadership and Management
{{#each skills.managementAndLeadership}}
- {{this}}
{{/each}}

### Technical Skills
{{#each skills.technical}}
- {{this}}
{{/each}}

## Professional Affiliations and Leadership Roles
{{#each professionalAffiliations}}
### {{organization}}
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

## Additional Federal Information
- **Citizenship Status:** {{personalInfo.citizenship}}
- **Security Clearance:** Not Required
- **Veterans' Preference:** Not Applicable
- **Federal Civilian Status:** Not Applicable
- **Availability:** Immediate
- **Travel Requirements:** Willing to Travel as Needed
- **Desired Locations:** Illinois and surrounding states
- **Work Schedule:** Full-time, including occasional evenings and weekends as required
- **Work Environment:** Professional office environment with field work as needed
- **Physical Requirements:** Able to perform essential functions with or without reasonable accommodation
- **Total Years of Professional Experience:** {{calculateTotalYears allExperience}}

---

CERTIFICATION OF ACCURACY: I certify that, to the best of my knowledge and belief, all of the information included in this resume is true, correct, and complete. I understand that any falsification or material omission of information may result in denial of employment, removal from federal service, and/or prosecution under 18 U.S.C. § 1001.

_Supporting documentation available upon request_

**Note: This resume follows USAJOBS format requirements and Office of Personnel Management (OPM) guidelines**
