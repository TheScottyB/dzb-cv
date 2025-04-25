import { BaseTemplate } from './base-template.js';
import type { CVData } from '../../../types/cv-base.js';
import type { TemplateOptions } from '../../../types/cv-types.js';

export class BasicTemplate extends BaseTemplate {
  id = 'basic';
  name = 'basic';

  generateMarkdown(data: CVData, options?: TemplateOptions): string {
    let md = '';
    if (!options || options.includePersonalInfo !== false) {
      md += `# ${data.personalInfo?.name?.full || ''}\n\n`;
    }
    // Professional Experience section
    if (!options || options.includeExperience !== false) {
      md += '## Professional Experience\n';
      if (data.experience && data.experience.length > 0) {
        for (const exp of data.experience) {
          const position = (exp as any).title || exp.position || '';
          const employer = (exp as any).company || exp.employer || '';
          const dateRange = [exp.startDate, exp.endDate].filter(Boolean).join(' - ');
          md += `### ${position} at ${employer}\n`;
          md += `${dateRange}\n`;
          if (exp.responsibilities?.length) {
            for (const r of exp.responsibilities) {
              md += `- ${r}\n`;
            }
          }
          md += '\n';
        }
      }
    }
    // Education section
    if (!options || options.includeEducation !== false) {
      md += '## Education\n';
      if (data.education && data.education.length > 0) {
        for (const edu of data.education) {
          md += `### ${edu.degree} - ${edu.institution}\n`;
          md += `${edu.completionDate || edu.year || ''}\n\n`;
        }
      }
    }
    // Skills section
    if (!options || options.includeSkills !== false) {
      md += '## Skills\n';
      if (data.skills && data.skills.length > 0) {
        for (const skill of data.skills) {
          md += `- ${skill}\n`;
        }
      }
    }
    return md.trim();
  }
  getStyles(): string {
    return `
      body {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        background: #fff;
        color: #333;
        padding: 20mm;
      }
      @media print {
        body {
          padding: 10mm;
        }
      }
    `;
  }
  protected generateExperience(data: CVData, options?: TemplateOptions): string {
    return '';
  }
  protected generateEducation(data: CVData, options?: TemplateOptions): string {
    return '';
  }
  protected generateSkills(data: CVData, options?: TemplateOptions): string {
    return '';
  }
  protected generatePublications(data: CVData, options?: TemplateOptions): string {
    return '';
  }
  protected generateConferences(data: CVData, options?: TemplateOptions): string {
    return '';
  }
  protected generateGrants(data: CVData, options?: TemplateOptions): string {
    return '';
  }
  protected generateAwards(data: CVData, options?: TemplateOptions): string {
    return '';
  }
}
