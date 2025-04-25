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
        margin-bottom: 4mm;
        border-bottom: 1pt solid #000;
      }
      h3 {
        font-size: 12pt;
        margin-bottom: 2mm;
      }
      .contact-info {
        text-align: center;
        margin-bottom: 8mm;
      }
      .experience-item {
        margin-bottom: 6mm;
        page-break-inside: avoid;
      }
      .experience-date {
        font-weight: bold;
      }
      .job-details {
        margin: 2mm 0;
      }
      .job-details p {
        margin: 1mm 0;
      }
      ul {
        margin: 2mm 0;
        padding-left: 5mm;
      }
      li {
        margin-bottom: 2mm;
      }
      .skills-section {
        column-count: 2;
        column-gap: 6mm;
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
    const citizenship = personalInfo.citizenship ? 
      `\nCitizenship: ${personalInfo.citizenship}` : '';

    return `
# ${personalInfo.name.full}
<div class="contact-info">
${personalInfo.contact.address || ''}\n
${personalInfo.contact.phone} | ${personalInfo.contact.email}${citizenship}
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

<p><strong>${exp.employer}</strong></p>
<p>${exp.location || 'Location not specified'}</p>
<p>${exp.period}</p>
<p>Hours per week: ${exp.employmentType === 'full-time' ? '40' : '20'}</p>
<p>Salary: ${exp.salary || 'Not specified'}</p>
<p>Supervisor: ${exp.supervisor || 'Available upon request'}</p>

${exp.responsibilities.map(r => `<p>${r}</p>`).join('\n')}

${exp.achievements?.length ? `
<h4>Achievements:</h4>
${exp.achievements.map(a => `<p>${a}</p>`).join('\n')}
` : ''}

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

${data.education.map(edu => `
<div class="education-item">
<p><strong>${edu.degree}</strong></p>
<p>${edu.institution}</p>
<p>${edu.field ? `Field of Study: ${edu.field}` : ''}</p>
<p>Completion Date: ${edu.completionDate || edu.year}</p>
${edu.notes ? `<p>${edu.notes}</p>` : ''}
</div>
`).join('\n')}
    `.trim();
  }
}

