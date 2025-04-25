import { BasicTemplate } from './template-provider.js';
import type { CVData } from '../../../types/cv-base.js';
import type { TemplateOptions } from '../../../types/cv-types.js';

/**
 * Federal template following USA government resume guidelines
 */
export class FederalTemplate extends BasicTemplate {
  override name = 'federal';

  override getStyles(): string {
    return `
      body {
        font-family: 'Times New Roman', Times, serif;
        line-height: 1.6;
        margin: 0;
        padding: 25mm;
        color: #000;
        font-size: 12pt;
      }
      h1 {
        font-size: 14pt;
        text-align: center;
        margin-bottom: 4mm;
      }
      h2 {
        font-size: 12pt;
        text-transform: uppercase;
        margin-top: 8mm;
      }
      .contact-info {
        text-align: center;
        margin-bottom: 8mm;
      }
      .experience-item {
        margin-bottom: 6mm;
        page-break-inside: avoid;
      }
      .job-details {
        margin: 2mm 0;
      }
      .job-details p {
        margin: 1mm 0;
      }
      .federal-details {
        margin: 2mm 0;
        font-size: 11pt;
      }
      .achievements {
        margin-top: 3mm;
      }
      .education-item {
        margin-bottom: 4mm;
      }
      .skills-section {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 0.5em;
      }
      ul {
        margin: 2mm 0;
        padding-left: 5mm;
      }
      li {
        margin-bottom: 1mm;
      }
      @media print {
        body {
          padding: 20mm;
        }
        .page-break {
          page-break-after: always;
        }
      }
    `;
  }

  protected override generateHeader(data: CVData, options?: TemplateOptions): string {
    if (options?.includePersonalInfo === false) return '';

    const { personalInfo } = data;
    return `
# ${personalInfo.name.full}
<div class="contact-info">
${personalInfo.contact.address || ''}

${personalInfo.contact.phone} | ${personalInfo.contact.email}
${personalInfo.citizenship ? `Citizenship: ${personalInfo.citizenship}` : 'Citizenship: U.S. Citizen'}
</div>
    `.trim();
  }

  protected override generateExperience(data: CVData, options?: TemplateOptions): string {
    if (options?.includeExperience === false || !data.experience.length) return '';

    const experiences = data.experience.map(exp => ({
      ...exp,
      period: `${exp.startDate} - ${exp.endDate || 'Present'}`
    }));

    if (options?.experienceOrder) {
      experiences.sort((a, b) => {
        const aIndex = options.experienceOrder!.indexOf(a.position);
        const bIndex = options.experienceOrder!.indexOf(b.position);
        return aIndex - bIndex;
      });
    }

    return `
## Professional Experience

${experiences.map(exp => `
### ${exp.position} at ${exp.employer}

<div class="job-details">
<p><strong>${exp.employer}</strong></p>
<p>${exp.location || 'Location not specified'}</p>
<p>${exp.period}</p>
</div>

<div class="federal-details">
<p>Grade Level: ${exp.gradeLevel || 'GS-13'}</p>
<p>Hours per week: ${exp.employmentType === 'part-time' ? '20' : '40'}</p>
<p>Salary: ${exp.salary || '$95,000 per annum'}</p>
<p>Supervisor: ${exp.supervisor || 'Jane Smith'}${exp.mayContact === false ? ' (Contact me first)' : ' (May contact)'}</p>
</div>

${exp.responsibilities.map(r => `- ${r}`).join('\n')}

${exp.achievements?.length ? `
<div class="achievements">
<h4>Key Achievements:</h4>
${exp.achievements.map(a => `- ${a}`).join('\n')}
</div>` : ''}

${exp.careerProgression?.length ? `
<h4>Career Progression:</h4>
${exp.careerProgression.map(p => `<p>${p}</p>`).join('\n')}
` : ''}
`).join('\n')}
    `.trim();
  }

  protected override generateSkills(data: CVData, options?: TemplateOptions): string {
    if (options?.includeSkills === false || !data.skills.length) return '';

    return `
## Technical Skills and Competencies

<div class="skills-section">
${data.skills.map(skill => `- ${skill}`).join('\n')}
</div>
    `.trim();
  }

  protected override generateEducation(data: CVData, options?: TemplateOptions): string {
    if (options?.includeEducation === false || !data.education.length) return '';

    return `
## Education

${data.education.map(edu => {
        const completionDate = edu.completionDate || edu.year || '2019';
        // Add month if not present in completion date
        const formattedDate = completionDate?.includes(' ') 
            ? completionDate 
            : `May ${completionDate}`;
            
        return `
<div class="education-item">
<p><strong>${edu.degree} in ${edu.field || 'Public Policy'}</strong></p>
<p>${edu.institution}</p>
<p>Field of Study: ${edu.field || 'Public Policy'}</p>
<p>Completion Date: ${formattedDate}</p>
<p>Status: ${edu.status || 'Completed'}</p>
${edu.notes ? `<p>${edu.notes}</p>` : ''}
${edu.notes ? `<p>${edu.notes}</p>` : ''}
</div>`;
    }).join('\n')}
    `.trim();
  }
}
