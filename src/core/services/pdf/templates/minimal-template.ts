import type { CVData } from '../../../types/cv-base.js';
import type { TemplateOptions } from '../../../types/cv-types.js';
import { BasicTemplate } from './template-provider.js';

/**
 * Minimal template with clean, minimalist styling
 */
export class MinimalTemplate extends BasicTemplate {
  override name = 'minimal';

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

${experience.map(exp => {
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

${exp.responsibilities?.map(r => `- ${r}`).join('\n') || ''}

${exp.achievements?.length ? `
<div class="achievements">
${exp.achievements.map(a => `- ${a}`).join('\n')}
</div>` : ''}`;
    }).join('\n')}
    `.trim();
  }

  protected override generateSkills(data: CVData, options?: TemplateOptions): string {
    if (options?.includeSkills === false || !data.skills.length) return '';

    return `
## Skills

<div class="skills-list">
${data.skills.map(skill => `<span class="skill-item">${skill}</span>`).join('\n')}
</div>
    `.trim();
  }

  protected override generateEducation(data: CVData, options?: TemplateOptions): string {
    if (options?.includeEducation === false || !data.education?.length) return '';

    return `
## Education

${data.education.map(edu => `
### ${edu.degree} - ${edu.institution}
${edu.completionDate || edu.year}
`).join('\n')}
    `.trim();
  }

  private orderExperienceEntries(experience: CVData['experience'], order: string[]): CVData['experience'] {
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
