import puppeteer, { PDFOptions } from 'puppeteer';
import type { MarkdownIt } from 'markdown-it';
import { writeFile } from 'fs/promises';
import type { CVData } from '../../types/cv-base.js';
import type { PDFGenerationOptions as CVPDFOptions } from '../../types/cv-generation.js';
import { PDFGenerator } from './pdf-generator.js';

/**
 * Implementation of the PDFGenerator interface using Puppeteer
 */
export class PDFGeneratorImpl extends PDFGenerator {
  private readonly markdown: MarkdownIt;

  constructor() {
    super();
    this.markdown = require('markdown-it')();
  }

  async generate(data: CVData, options?: Partial<CVPDFOptions>): Promise<Buffer> {
    const markdown = this.formatCVData(data);
    const html = this.generateHTML(data);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
      await page.setContent(html);
      const pdfOptions = this.getPDFOptions(options);
      const pdf = await page.pdf(pdfOptions);
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  async generateFromMarkdown(
    markdown: string,
    outputPath: string,
    options?: Partial<CVPDFOptions>,
  ): Promise<string> {
    const html = this.markdown.render(markdown);
    return this.generateFromHTML(html, outputPath, options);
  }

  async generateFromHTML(
    html: string,
    outputPath: string,
    options?: Partial<CVPDFOptions>,
  ): Promise<string> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
      await page.setContent(html);
      const pdfOptions = this.getPDFOptions(options);
      const pdf = await page.pdf(pdfOptions);
      await writeFile(outputPath, pdf);
      return outputPath;
    } finally {
      await browser.close();
    }
  }

  async generateFromTemplate(
    templatePath: string,
    data: CVData,
    outputPath: string,
    options?: Partial<CVPDFOptions>,
  ): Promise<string> {
    throw new Error('Template-based generation not implemented');
  }

  protected generateHTML(data: CVData): string {
    const markdown = this.formatCVData(data);
    const html = this.markdown.render(markdown);
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>${this.getStyles()}</style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;
  }

  private formatCVData(data: CVData): string {
    const { personalInfo, education, experience, skills, certifications } = data;
    const { name } = personalInfo;

    // Safely access email and phone from either direct properties or contact object
    const email = personalInfo.email || personalInfo.contact?.email || '';
    const phone = personalInfo.phone || personalInfo.contact?.phone || '';
    const address = personalInfo.address?.formatted || personalInfo.contact?.address || '';

    return `
# ${name.full || `${name.first} ${name.last}`}
${personalInfo.title ? `*${personalInfo.title}*` : ''}

${email} | ${phone}
${address}

${
  personalInfo.summary
    ? `
## Professional Summary
${personalInfo.summary}
`
    : ''
}

## Education
${education
  .map(
    (edu) => `
### ${edu.institution}
${edu.degree}
${edu.year || edu.endDate || ''}${edu.gpa ? `\nGPA: ${edu.gpa}` : ''}${edu.honors?.length ? `\nHonors: ${edu.honors.join(', ')}` : ''}
`,
  )
  .join('\n')}

## Experience
${experience
  .map(
    (exp) => `
### ${exp.position} at ${exp.employer}
${exp.startDate} - ${exp.endDate || 'Present'}
${exp.location ? `Location: ${exp.location}` : ''}

${exp.responsibilities ? exp.responsibilities.map((r) => `- ${r}`).join('\n') : ''}
${
  exp.achievements?.length
    ? `
#### Achievements
${exp.achievements.map((a) => `- ${a}`).join('\n')}
`
    : ''
}
`,
  )
  .join('\n')}

${
  skills?.length
    ? `
## Skills
${skills.map((skill) => typeof skill === 'string' ? `- ${skill}` : `- ${skill.name}${skill.level ? ` (${skill.level})` : ''}`).join('\n')}
`
    : ''
}

${
  certifications?.length
    ? `
## Certifications
${certifications.map((cert) => typeof cert === 'string' ? `- ${cert}` : `- ${cert.name}${cert.issuer ? ` - ${cert.issuer}` : ''}`).join('\n')}
`
    : ''
}
    `.trim();
  }

  private getStyles(): string {
    return `
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        margin: 0;
        padding: 20px;
        color: #333;
      }
      h1 {
        color: #2c3e50;
        font-size: 24px;
        margin-bottom: 10px;
      }
      h2 {
        color: #34495e;
        font-size: 20px;
        margin-top: 20px;
        margin-bottom: 10px;
      }
      h3 {
        color: #2c3e50;
        font-size: 16px;
        margin-bottom: 5px;
      }
      .experience-item {
        margin-bottom: 15px;
      }
      .date-range {
        color: #666;
        font-style: italic;
      }
    `;
  }

  private getPDFOptions(options?: Partial<CVPDFOptions>): PDFOptions {
    return {
      format: (options?.paperSize || 'A4').toLowerCase() as any,
      margin: options?.margins || {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
      },
      printBackground: true,
      displayHeaderFooter: options?.includeHeaderFooter || false,
      headerTemplate: options?.headerText || '',
      footerTemplate: options?.footerText || '',
      landscape: options?.orientation === 'landscape',
    };
  }
}
