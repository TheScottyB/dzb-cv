import { BasicTemplate } from './template-provider.js';
import type { CVData } from '../../../types/cv-base.js';
import type { TemplateOptions } from '../../../types/cv-generation.js';
import type { Experience } from '../../../types/cv-base.js';

/**
 * Federal template following USA government resume guidelines
 */
export class FederalTemplate extends BasicTemplate {
  name = 'federal';

  getStyles(): string {
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

  protected generateHeader(data: CVData, options?: TemplateOptions): string {
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

  protected generateExperience(data: CVData, options?: TemplateOptions): string {
    if (options?.includeExperience === false || !data.experience.length) return '';

    let experience = data.experience;
    if (options?.experienceFilter) {
      experience = experience.filter(exp => options.experienceFilter?.({
        employer: exp.company,
        position: exp.title,
        period: `${exp.startDate} - ${exp.endDate || 'Present'}`,
        duties: exp.responsibilities
      }));
    }
    if (options?.experienceOrder) {
      experience = experience.sort((a, b) => {
        const aIndex = options.experienceOrder!.indexOf(a.title);
        const bIndex = options.experienceOrder!.indexOf(b.title);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
    }

    return `
## Work Experience

${experience.map(exp => `
<div class="experience-item">
### ${exp.title}
<div class="job-details">
<p><strong>${exp.company}</strong></p>
<p class="experience-date">${exp.startDate} - ${exp.endDate || 'Present'}</p>
</div>

Duties and Accomplishments:
${exp.responsibilities.map(r => `- ${r}`).join('\n')}
</div>
`).join('\n\n')}
    `.trim();
  }

  protected generateSkills(data: CVData, options?: TemplateOptions): string {
    if (options?.includeSkills === false || !data.skills.length) return '';

    return `
## Technical Skills and Competencies

<div class="skills-section">
${data.skills.map(skill => `- ${skill}`).join('\n')}
</div>
    `.trim();
  }

  protected generateEducation(data: CVData, options?: TemplateOptions): string {
    if (options?.includeEducation === false || !data.education.length) return '';

    return `
## Education

${data.education.map(edu => `
### ${edu.institution}
<div class="job-details">
<p>${edu.degree}${edu.field ? ` in ${edu.field}` : ''}</p>
<p>Completion Date: ${edu.completion_date || edu.year}</p>
${edu.status ? `<p>Status: ${edu.status}</p>` : ''}
${edu.notes ? `<p>${edu.notes}</p>` : ''}
</div>
`).join('\n')}
    `.trim();
  }
}

