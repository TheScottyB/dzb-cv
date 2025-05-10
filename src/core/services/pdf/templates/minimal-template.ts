import type { CVData } from '../../../types/cv-base.js';
import type { TemplateOptions } from '../../../types/cv-types.js';
import { BasicTemplate } from './basic-template.js';

/**
 * Minimal template with clean, minimalist styling
 */
export class MinimalTemplate extends BasicTemplate {
  id = 'minimal';
  name = 'minimal';

  generateMarkdown(data: CVData, options?: TemplateOptions): string {
    let md = '';
    if (!options || options.includePersonalInfo !== false) {
      md += `# ${data.personalInfo?.name?.full || ''}\n`;
      if (data.personalInfo?.title) {
        md += `${data.personalInfo.title}\n`;
      }
      if (data.personalInfo?.contact) {
        const { email, phone, address } = data.personalInfo.contact;
        md += `${[email, phone, address].filter(Boolean).join(' · ')}\n`;
      }
    }
    // Experience
    if (!options || options.includeExperience !== false) {
      md += '\n## Experience\n';
      if (data.experience && data.experience.length > 0) {
        for (const exp of data.experience) {
          const position = (exp as any).title || exp.position || '';
          const employer = (exp as any).company || exp.employer || '';
          md += `### ${position} · ${employer}\n`;
          if (exp.responsibilities?.length) {
            for (const r of exp.responsibilities) md += `- ${r}\n`;
          }
        }
      }
    }
    // Skills
    if (!options || options.includeSkills !== false) {
      md += '\n## Skills\n<div class="skills-list">\n';
      if (data.skills && data.skills.length > 0) {
        for (const skill of data.skills) md += `<span class="skill-item">${skill}</span>\n`;
      }
      md += '</div>\n';
    }
    // Education
    if (!options || options.includeEducation !== false) {
      md += '\n## Education\n';
      if (data.education && data.education.length > 0) {
        for (const edu of data.education) {
          md += `### ${edu.degree} - ${edu.institution}\n`;
          md += `${edu.completionDate || edu.year || ''}\n`;
        }
      }
    }
    return md.trim();
  }

  override getStyles(): string {
    return `
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        line-height: 1.5;
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
      }
      
      h3 {
        font-size: 15px;
        font-weight: 600;
        margin-bottom: 2px;
      }
      
      .contact-info {
        color: #586069;
        font-size: 14px;
        margin-bottom: 20px;
      }
      
      .experience-item {
        margin-bottom: 20px;
        page-break-inside: avoid;
      }
      
      .job-details {
        color: #586069;
        font-size: 13px;
        margin: 0.5rem 0;
      }
      
      .date, .location {
        display: inline-block;
        margin-right: 1rem;
      }
      
      .skills-list {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 10px;
      }
      
      .skill-item {
        color: #24292e;
        font-size: 13px;
        padding: 2px 8px;
        border: 1px solid #e1e4e8;
        border-radius: 12px;
      }
      
      ul {
        padding-left: 18px;
        margin: 8px 0;
      }
      
      li {
        margin-bottom: 4px;
        font-size: 14px;
      }
      
      @media print {
        body {
          padding: 20px;
          max-width: none;
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
<div style="color:#586069;font-size:15px;margin-bottom:8px;">${personalInfo.title || ''}</div>

<div class="contact-info">
${[personalInfo.contact.email, personalInfo.contact.phone, personalInfo.contact.address].filter(Boolean).join(' · ')}
</div>
    `.trim();
  }

  protected override generateExperience(data: CVData, options?: TemplateOptions): string {
    if (options?.includeExperience === false || !data.experience.length) return '';

    let experience = data.experience;
    if (options?.experienceOrder) {
      experience = this.orderExperienceEntries(experience, options.experienceOrder);
    }

    return `
## Experience

${experience
  .map((exp) => {
    // Handle test data format vs actual CV data format
    // TypeScript doesn't know about the test data structure with title/company
    const testData = exp as any;
    const position = testData.title || exp.position || '';
    const employer = testData.company || exp.employer || '';
    const location = exp.location || '';
    const dateRange = `${exp.startDate}${exp.endDate ? ` - ${exp.endDate}` : ''}`;

    return `
### ${position} · ${employer}

<div class="job-details">
<span class="date">${dateRange}</span>
${location ? `<span class="location">${location}</span>` : ''}
</div>

${exp.responsibilities?.map((r) => `- ${r}`).join('\n') || ''}

${
  exp.achievements?.length
    ? `
<div class="achievements">
${exp.achievements.map((a) => `- ${a}`).join('\n')}
</div>`
    : ''
}`;
  })
  .join('\n')}
    `.trim();
  }

  protected override generateSkills(data: CVData, options?: TemplateOptions): string {
    if (options?.includeSkills === false || !data.skills.length) return '';

    return `
## Skills

<div class="skills-list">
${data.skills.map((skill) => `<span class="skill-item">${skill}</span>`).join('\n')}
</div>
    `.trim();
  }

  protected override generateEducation(data: CVData, options?: TemplateOptions): string {
    if (options?.includeEducation === false || !data.education?.length) return '';

    return `
## Education

${data.education
  .map(
    (edu) => `
### ${edu.degree} - ${edu.institution}
${edu.completionDate || edu.year}
`
  )
  .join('\n')}
    `.trim();
  }

  private orderExperienceEntries(
    experience: CVData['experience'],
    order: string[]
  ): CVData['experience'] {
    return experience.sort((a, b) => {
      // Handle both formats for position/title
      const testDataA = a as any;
      const testDataB = b as any;
      const aPos = testDataA.title || a.position || '';
      const bPos = testDataB.title || b.position || '';
      const aIndex = order.indexOf(aPos);
      const bIndex = order.indexOf(bPos);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  }
}
