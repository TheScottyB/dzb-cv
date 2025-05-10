import type { CVData, PDFGenerationOptions } from '@dzb-cv/types';
import type { RichPDFGenerator } from './interface.js';
import puppeteer, { PaperFormat } from 'puppeteer';
import MarkdownIt from 'markdown-it';
/**
 * Rich PDF generator using Puppeteer for HTML/Markdown support
 * @class PuppeteerGenerator
 * @implements {RichPDFGenerator}
 */
export class PuppeteerGenerator implements RichPDFGenerator {
  private readonly markdown: MarkdownIt;

  constructor() {
    this.markdown = new MarkdownIt();
  }

  async generate(data: CVData, options?: PDFGenerationOptions): Promise<Buffer> {
    const html = this.generateHTML(data);
    return this.generateFromHTML(html, options);
  }

  async generateFromMarkdown(markdown: string, options?: PDFGenerationOptions): Promise<Buffer> {
    const html = this.markdown.render(markdown);
    return this.generateFromHTML(html, options);
  }

  async generateFromHTML(html: string, options?: PDFGenerationOptions): Promise<Buffer> {
    const browser = await puppeteer.launch();
    try {
      const page = await browser.newPage();
      await page.setContent(html);

      const pdfOptions = {
        format: (options?.format?.toLowerCase() || 'letter') as PaperFormat,
        margin: options?.margin || { top: '1in', right: '1in', bottom: '1in', left: '1in' },
        printBackground: true,
        displayHeaderFooter: options?.includeHeaderFooter || false,
        headerTemplate: options?.headerText || '',
        footerTemplate: options?.footerText || '',
        landscape: options?.orientation === 'landscape',
      };

      return await page.pdf(pdfOptions);
    } finally {
      await browser.close();
    }
  }

  private generateHTML(data: CVData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${data.personalInfo.name.full} - CV</title>
          <style>${this.getStyles()}</style>
        </head>
        <body>
          <h1>${data.personalInfo.name.full}</h1>
          <div class="contact-info">
            ${data.personalInfo.contact.email} | ${data.personalInfo.contact.phone}
          </div>
          
          <div class="section">
            <h2>Professional Experience</h2>
            ${data.experience
              .map(
                (exp) => `
              <div>
                <h3>${exp.position} at ${exp.employer}</h3>
                <p>${exp.startDate} - ${exp.endDate || 'Present'}</p>
                <ul>
                  ${exp.responsibilities.map((r) => `<li>${r}</li>`).join('')}
                </ul>
              </div>
            `
              )
              .join('')}
          </div>

          <div class="section">
            <h2>Education</h2>
            ${data.education
              .map(
                (edu) => `
              <div>
                <h3>${edu.degree} in ${edu.field}</h3>
                <p>${edu.institution}, ${edu.graduationDate}</p>
              </div>
            `
              )
              .join('')}
          </div>

          <div class="section">
            <h2>Skills</h2>
            <ul>
              ${data.skills.map((skill) => `<li>${skill.name}</li>`).join('')}
            </ul>
          </div>
        </body>
      </html>
    `;
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
      .contact-info {
        margin-bottom: 20px;
      }
      .section {
        margin-bottom: 30px;
      }
      ul {
        margin-top: 5px;
      }
    `;
  }
}
