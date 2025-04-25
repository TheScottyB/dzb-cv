import type { CVData } from '../../../types/cv-base.js';
import type { TemplateOptions } from '../../../types/cv-types.js';

/**
 * Interface for CV template implementations
 */
export interface CVTemplate {
  name: string;
  generateMarkdown(data: CVData, options?: TemplateOptions): string;
  getStyles(): string;
}

/**
 * Basic template implementation
 */
export class BasicTemplate implements CVTemplate {
  name = 'basic';

  generateMarkdown(data: CVData, options?: TemplateOptions): string {
    const sections = [
      this.generateHeader(data, options),
      this.generateSummary(data, options),
      this.generateExperience(data, options),
      this.generateEducation(data, options),
      this.generateSkills(data, options),
      this.generateCertifications(data, options)
    ].filter(Boolean);

    return sections.join('\n\n');
  }

  getStyles(): string {
    return `
      body {
        font-family: 'Arial', sans-serif;
        line-height: 1.6;
        margin: 0;
        padding: 40px;
        color: #333;
      }
      h1 {
        color: #2c3e50;
        font-size: 28px;
        margin-bottom: 10px;
      }
      h2 {
        color: #34495e;
        font-size: 22px;
        border-bottom: 2px solid #eee;
        padding-bottom: 5px;
        margin-top: 25px;
      }
      h3 {
        color: #2c3e50;
        font-size: 18px;
        margin-bottom: 5px;
      }
      .contact-info {
        color: #666;
        margin-bottom: 20px;
      }
      .section {
        margin-bottom: 30px;
      }
      .experience-item {
        margin-bottom: 20px;
        page-break-inside: avoid;
      }
      .experience-header {
        margin-bottom: 10px;
      }
      .experience-date {
        color: #666;
        font-style: italic;
      }
      .skills-list {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 10px;
      }
      .skill-item {
        background: #f7f9fc;
        padding: 5px 12px;
        border-radius: 15px;
        font-size: 14px;
      }
      @media print {
        body { padding: 20px; }
        .page-break { page-break-after: always; }
      }
    `;
  }

  protected generateHeader(data: CVData, options?: TemplateOptions): string {
    if (options?.includePersonalInfo === false) return '';

    const { personalInfo } = data;
    return `
# ${personalInfo.name.full}
${personalInfo.title ? `*${personalInfo.title}*\n` : ''}

<div class="contact-info">

${[
  personalInfo.contact.email,
  personalInfo.contact.phone,
  personalInfo.contact.address
].filter(Boolean).join(' | ')}

</div>
    `.trim();
  }

  protected generateSummary(data: CVData, options?: TemplateOptions): string {
    if (options?.includeProfessionalSummary === false || !data.professionalSummary) return '';

    return `
## Professional Summary

${data.professionalSummary}
    `.trim();
  }

  protected generateExperience(data: CVData, options?: TemplateOptions): string {
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
## Experience

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

  protected generateEducation(data: CVData, options?: TemplateOptions): string {
    if (options?.includeEducation === false || !data.education.length) return '';

    return `
## Education

${data.education.map(edu => `
### ${edu.degree} - ${edu.institution}
${edu.year}${edu.field ? ` - ${edu.field}` : ''}
${edu.notes ? `\n${edu.notes}` : ''}
`).join('\n')}
    `.trim();
  }

  protected generateSkills(data: CVData, options?: TemplateOptions): string {
    if (options?.includeSkills === false || !data.skills.length) return '';

    return `
## Skills

<div class="skills-list">
${data.skills.map(skill => `<span class="skill-item">${skill}</span>`).join('\n')}
</div>
    `.trim();
  }

  protected generateCertifications(data: CVData, options?: TemplateOptions): string {
    if (options?.includeCertifications === false || !data.certifications.length) return '';

    return `
## Certifications

${data.certifications.map(cert => `- ${cert}`).join('\n')}
    `.trim();
  }
}

/**
 * Factory for creating CV templates
 */
export class TemplateProvider {
  private templates: Map<string, CVTemplate> = new Map();

  constructor() {
    const basicTemplate = new BasicTemplate();
    this.templates.set(basicTemplate.name, basicTemplate);
  }

  getTemplate(name: string = 'basic'): CVTemplate {
    const template = this.templates.get(name);
    if (!template) {
      throw new Error(`Template '${name}' not found`);
    }
    return template;
  }

  registerTemplate(template: CVTemplate): void {
    this.templates.set(template.name, template);
  }
}

