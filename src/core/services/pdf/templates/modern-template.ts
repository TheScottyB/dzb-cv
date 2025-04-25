import { BasicTemplate } from './template-provider.js';
import type { CVData } from '../../../types/cv-base.js';
import type { TemplateOptions } from '../../../types/cv-generation.js';

/**
 * Modern template with clean, contemporary styling
 */
export class ModernTemplate extends BasicTemplate {
  name = 'modern';

  getStyles(): string {
    return `
      body {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        line-height: 1.7;
        margin: 0;
        padding: 30px;
        color: #444;
        background-color: #fff;
      }
      h1 {
        font-size: 32px;
        color: #2573cf;
        margin-bottom: 5px;
        font-weight: 600;
        letter-spacing: -0.5px;
      }
      h2 {
        color: #2573cf;
        font-size: 22px;
        border-bottom: 1px solid #e1e4e8;
        padding-bottom: 8px;
        margin-top: 35px;
        font-weight: 500;
      }
      h3 {
        font-size: 18px;
        margin-bottom: 4px;
        font-weight: 500;
      }
      .contact-info {
        color: #666;
        margin-bottom: 25px;
        font-size: 15px;
      }
      .experience-item {
        margin-bottom: 25px;
        page-break-inside: avoid;
        padding-left: 10px;
        border-left: 2px solid #e1e4e8;
      }
      .experience-date {
        color: #666;
        font-style: italic;
        font-size: 14px;
        margin-bottom: 10px;
      }
      .skills-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 15px;
      }
      .skill-item {
        background: #f0f7ff;
        color: #2573cf;
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 500;
      }
      ul {
        padding-left: 20px;
      }
      li {
        margin-bottom: 5px;
      }
      @media print {
        body { padding: 15px; }
        .page-break { page-break-after: always; }
      }
    `;
  }

  protected generateHeader(data: CVData, options?: TemplateOptions): string {
    if (options?.includePersonalInfo === false) return '';

    const { personalInfo } = data;
    return `
# ${personalInfo.name.full}
${personalInfo.title ? `<span style="color:#666;font-size:18px;">${personalInfo.title}</span>\n` : ''}

<div class="contact-info">

${[
  personalInfo.contact.email,
  personalInfo.contact.phone,
  personalInfo.contact.address
].filter(Boolean).join(' | ')}

</div>
    `.trim();
  }
}

