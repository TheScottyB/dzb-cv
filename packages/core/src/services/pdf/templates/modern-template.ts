import { BasicTemplate } from './basic-template.js';
import type { CVData } from '@dzb-cv/common';
import type { PDFGenerationOptions } from '@dzb-cv/common';

/**
 * Modern template with clean, contemporary styling
 */
export class ModernTemplate extends BasicTemplate {
  override name = 'modern';

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
      .date {
        color: #666;
        font-size: 14px;
        margin-bottom: 4px;
      }
      .location {
        color: #666;
        font-size: 14px;
        margin-bottom: 8px;
      }
      .responsibilities {
        margin-left: 20px;
      }
      .responsibilities li {
        margin-bottom: 4px;
      }
      .achievements {
        margin-top: 8px;
        margin-left: 20px;
      }
      .achievements li {
        margin-bottom: 4px;
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

  protected override generateHeader(data: CVData, options?: PDFGenerationOptions): string {
    if (options?.includePersonalInfo === false) return '';

    const { 
      personalInfo: {
        name: { full: name = '' } = {},
        title,
        contact = {}
      } = {}
    } = data;

    return `
# ${name}
${title ? `<span style="color:#666;font-size:18px;">${title}</span>\n` : ''}

<div class="contact-info">

${[
  contact.email,
  contact.phone,
  contact.address
].filter(Boolean).join(' | ')}

</div>
    `.trim();
  }
}

