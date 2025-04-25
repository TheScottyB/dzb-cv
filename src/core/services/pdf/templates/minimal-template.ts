import type { CVData, Experience } from '../../../types/cv-base.js';
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
        font-family: -apple-system, system-ui, BlinkMacSystemFont, sans-serif;
        line-height: 1.5;
        margin: 0;
        padding: 25px;
        color: #24292e;
        max-width: 800px;
        margin: 0 auto;
      }
      h1 {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 4px;
        letter-spacing: -0.2px;
      }
      h2 {
        font-size: 16px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #586069;
        border-bottom: none;
        margin-top: 30px;
        margin-bottom: 12px;
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
      .experience-date {
        color: #586069;
        font-size: 13px;
        margin-bottom: 8px;
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
${personalInfo.title ? `<div style="color:#586069;font-size:15px;margin-bottom:8px;">${personalInfo.title}</div>` : ''}

<div class="contact-info">
${[
  personalInfo.contact.email,
  personalInfo.contact.phone,
  personalInfo.contact.address
].filter(Boolean).join(' · ')}
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

${experience.map(exp => `
<div class="experience-item">
<h3>${exp.position} at ${exp.employer}</h3>
<div class="job-details">
<p class="date">${exp.startDate} - ${exp.endDate || 'Present'}</p>
<p class="location">${exp.location || 'Location not specified'}</p>
</div>

${exp.responsibilities.map(r => `<p>${r}</p>`).join('\n')}

${exp.achievements?.length ? `
<h4>Achievements:</h4>
${exp.achievements.map(a => `<p>${a}</p>`).join('\n')}
` : ''}
</div>
`).join('\n')}
    `.trim();
  }

  protected override generateSkills(data: CVData, options?: TemplateOptions): string {
    if (options?.includeSkills === false || !data.skills.length) return '';

    return `
      <div class="skills-section">
        <h2>Skills</h2>
        <ul>
          ${data.skills.map(skill => `<li>${skill}</li>`).join('\n')}
        </ul>
      </div>
    `;
  }

  private orderExperienceEntries(experience: CVData['experience'], order: string[]): CVData['experience'] {
    return experience.sort((a, b) => {
      const aIndex = order.indexOf(a.position);
      const bIndex = order.indexOf(b.position);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  }
}

