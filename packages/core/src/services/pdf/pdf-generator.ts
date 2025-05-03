import type { 
  CVData, 
  PDFGenerationOptions,
  CVTemplate as PDFTemplate 
} from '@dzb-cv/common';
import type { PaperFormat } from 'puppeteer';
import puppeteer from 'puppeteer';
import { marked } from 'marked';
import { readFileSync } from 'fs';
import handlebars from 'handlebars';

/**
 * Puppeteer-specific PDF options
 */
interface PuppeteerPDFOptions {
  format?: PaperFormat;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  printBackground?: boolean;
  displayHeaderFooter?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
  landscape?: boolean;
  path?: string;
}

/**
 * Maps PDFGenerationOptions to PuppeteerPDFOptions
 */
function mapToPuppeteerOptions(options?: Partial<PDFGenerationOptions>): PuppeteerPDFOptions {
  if (!options) return { format: 'letter', printBackground: true };
  
  return {
    format: (options.format || 'letter') as PaperFormat,
    margin: options.margin || { top: '1in', right: '1in', bottom: '1in', left: '1in' },
    printBackground: true,
    displayHeaderFooter: options.headerTemplate !== undefined || options.footerTemplate !== undefined,
    headerTemplate: options.headerTemplate || '',
    footerTemplate: options.footerTemplate || '',
    landscape: options.orientation === 'landscape'
  };
}

/**
 * Abstract base class for PDF generation
 */
export abstract class PDFGenerator implements PDFTemplate {
  // Properties required by CVTemplate
  abstract name: string;
  title?: string;
  description?: string;

  // Method required by CVTemplate
  abstract render(data: CVData, options?: PDFGenerationOptions): Promise<string> | string;

  // PDF Generator specific methods
  abstract generate(
    data: CVData,
    options?: Partial<PDFGenerationOptions>
  ): Promise<Buffer>;

  abstract generateFromMarkdown(
    markdown: string,
    outputPath: string,
    options?: Partial<PDFGenerationOptions>
  ): Promise<string>;

  abstract generateFromHTML(
    html: string,
    outputPath: string,
    options?: Partial<PDFGenerationOptions>
  ): Promise<string>;

  abstract generateFromTemplate(
    templatePath: string,
    data: CVData,
    outputPath: string,
    options?: Partial<PDFGenerationOptions>
  ): Promise<string>;
}

/**
 * Default implementation of the PDF Generator
 */
export class DefaultPDFGenerator extends PDFGenerator {
  // Implement required CVTemplate properties
  name = 'default';
  title = 'Default PDF Template';
  description = 'A simple default template for CV generation';

  // Implement render method required by CVTemplate
  render(data: CVData, options?: PDFGenerationOptions): string {
    return this.generateHTML(data);
  }

  // Add template type validation
  private isValidTemplate(template?: string): template is 'default' | 'minimal' | 'federal' | 'academic' {
    if (!template) return true;
    return ['default', 'minimal', 'federal', 'academic'].includes(template);
  }

  async generate(data: CVData, options?: Partial<PDFGenerationOptions>): Promise<Buffer> {
    // Template validation with type guard
    if (options?.template && !this.isValidTemplate(options.template)) {
      throw new Error(`Template '${options.template}' not found`);
    }
    const browser = await puppeteer.launch();
    try {
      const page = await browser.newPage();
      const html = this.generateHTML(data);
      await page.setContent(html);

      const pdfOptions = mapToPuppeteerOptions(options);

      const pdfBuffer = await page.pdf(pdfOptions);
      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  async generateFromMarkdown(
    markdown: string,
    outputPath: string,
    options?: Partial<PDFGenerationOptions>,
  ): Promise<string> {
    const fs = await import('fs');
    const path = await import('path');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    const html = await marked(markdown);
    const result = await this.generateFromHTML(html, outputPath, options);
    return result;
  }

  async generateFromHTML(
    html: string,
    outputPath: string,
    options?: Partial<PDFGenerationOptions>,
  ): Promise<string> {
    const fs = await import('fs');
    const path = await import('path');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    const browser = await puppeteer.launch();
    try {
      const page = await browser.newPage();
      await page.setContent(html);

      const pdfOptions = mapToPuppeteerOptions(options);
      pdfOptions.path = outputPath;
      
      await page.pdf(pdfOptions);
      return outputPath;
    } finally {
      await browser.close();
    }
  }
  async generateFromTemplate(
    templatePath: string,
    data: CVData,
    outputPath: string,
    options?: Partial<PDFGenerationOptions>,
  ): Promise<string> {
    const templateContent = readFileSync(templatePath, 'utf-8');
    const template = handlebars.compile(templateContent);
    const html = template(data);
    const result = await this.generateFromHTML(html, outputPath, options);
    return result;
  }

  protected generateHTML(data: CVData): string {
    // Ensure all optional properties are handled safely through destructuring with defaults
    const {
      personalInfo: {
        name: { full: name = 'CV' } = {},
        contact = {}
      } = {},
      experience = [],
      education = [],
      skills = [],
      certifications = []
    } = data;
    
    // Basic HTML template
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${name} - CV</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #333; }
            .contact-info { margin-bottom: 20px; }
            .section { margin-bottom: 30px; }
          </style>
        </head>
        <body>
          <h1>${name}</h1>
          <div class="contact-info">
            ${contact.email ? contact.email : ''} ${contact.email && contact.phone ? '|' : ''} ${contact.phone ? contact.phone : ''}
          </div>
          
          <div class="section">
            <h2>Professional Experience</h2>
            ${experience
              .map(
                (exp) => `
                  <div>
                    <h3>${exp.position || ''} at ${exp.employer || ''}</h3>
                    <p>${exp.startDate || ''} - ${exp.endDate || 'Present'}</p>
                    ${exp.responsibilities ? `
                      <ul>
                        ${exp.responsibilities.map(r => `<li>${r}</li>`).join('')}
                      </ul>
                    ` : ''}
                  </div>
                `
              )
              .join('')}
          </div>

          <div class="section">
            <h2>Education</h2>
            ${education
              .map(
                (edu) => `
                  <div>
                    <h3>${edu.degree || ''} - ${edu.institution || ''}</h3>
                    <p>${edu.year || edu.startDate || ''}</p>
                  </div>
                `
              )
              .join('')}
          </div>

          <div class="section">
            <h2>Skills</h2>
            <ul>
              ${skills
                .map(skill => `<li>${typeof skill === 'string' ? skill : skill.name || ''}</li>`)
                .join('')}
            </ul>
          </div>

          ${certifications.length > 0 ? `
            <div class="section">
              <h2>Certifications</h2>
              <ul>
                ${certifications
                  .map(cert => `<li>${typeof cert === 'string' ? cert : cert.name || ''}</li>`)
                  .join('')}
              </ul>
            </div>
          ` : ''}
        </body>
      </html>
    `;
  }
}
