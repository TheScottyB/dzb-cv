import type { CVData } from '../../types/cv-base.js';
import type { PaperFormat } from 'puppeteer';
import puppeteer from 'puppeteer';
import { marked } from 'marked';
import { readFileSync } from 'fs';
import handlebars from 'handlebars';

/**
 * PDF generation options
 */
export interface PDFGenerationOptions {
  /** Whether to include header and footer in the PDF */
  includeHeaderFooter?: boolean;
  /** Text to display in the header */
  headerText?: string;
  /** Text to display in the footer */
  footerText?: string;
  /** Paper size for the PDF */
  paperSize?: PaperFormat;
  /** Margins for the PDF in inches */
  margins?: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  /** Title of the PDF document */
  pdfTitle?: string;
  /** Author of the PDF document */
  pdfAuthor?: string;
  /** Page orientation */
  orientation?: 'portrait' | 'landscape';
  /** Font family to use in the PDF */
  fontFamily?: string;
  /** Template to use */
  template?: 'default' | 'minimal' | 'federal' | 'academic';
}

/**
 * Abstract base class for PDF generation
 */
export abstract class PDFGenerator {
  abstract generate(data: CVData, options?: Partial<PDFGenerationOptions>): Promise<Buffer>;
  abstract generateFromMarkdown(
    markdown: string,
    outputPath: string,
    options?: Partial<PDFGenerationOptions>,
  ): Promise<string>;
  abstract generateFromHTML(
    html: string,
    outputPath: string,
    options?: Partial<PDFGenerationOptions>,
  ): Promise<string>;
  abstract generateFromTemplate(
    templatePath: string,
    data: CVData,
    outputPath: string,
    options?: Partial<PDFGenerationOptions>,
  ): Promise<string>;
  protected abstract generateHTML(data: CVData): string;
}

/**
 * Default implementation of PDF Generator
 */
export class DefaultPDFGenerator extends PDFGenerator {
  async generate(data: CVData, options?: Partial<PDFGenerationOptions>): Promise<Buffer> {
    // Template validation: fail fast for unknown types
    if (
      options?.template &&
      !['default', 'minimal', 'federal', 'academic'].includes(options.template)
    ) {
      throw new Error(`Template '${options.template}' not found`);
    }
    const browser = await puppeteer.launch();
    try {
      const page = await browser.newPage();
      const html = this.generateHTML(data);
      await page.setContent(html);

      const pdfOptions = {
        format: (options?.paperSize || 'letter') as PaperFormat,
        margin: options?.margins || { top: '1in', right: '1in', bottom: '1in', left: '1in' },
        printBackground: true,
        displayHeaderFooter: options?.includeHeaderFooter || false,
        headerTemplate: options?.headerText || '',
        footerTemplate: options?.footerText || '',
        landscape: options?.orientation === 'landscape',
      };

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

      const pdfOptions = {
        path: outputPath,
        format: (options?.paperSize || 'letter') as PaperFormat,
        margin: options?.margins || { top: '1in', right: '1in', bottom: '1in', left: '1in' },
        printBackground: true,
        displayHeaderFooter: options?.includeHeaderFooter || false,
        headerTemplate: options?.headerText || '',
        footerTemplate: options?.footerText || '',
        landscape: options?.orientation === 'landscape',
      };

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
    // Basic HTML template
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${data.personalInfo.name.full} - CV</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #333; }
            .contact-info { margin-bottom: 20px; }
            .section { margin-bottom: 30px; }
          </style>
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
                <h3>${exp.title} at ${exp.company}</h3>
                <p>${exp.startDate} - ${exp.endDate || 'Present'}</p>
                <ul>
                  ${exp.responsibilities.map((r) => `<li>${r}</li>`).join('')}
                </ul>
              </div>
            `,
              )
              .join('')}
          </div>

          <div class="section">
            <h2>Education</h2>
            ${data.education
              .map(
                (edu) => `
              <div>
                <h3>${edu.degree} - ${edu.institution}</h3>
                <p>${edu.year}</p>
              </div>
            `,
              )
              .join('')}
          </div>

          <div class="section">
            <h2>Skills</h2>
            <ul>
              ${data.skills.map((skill) => `<li>${skill}</li>`).join('')}
            </ul>
          </div>

          <div class="section">
            <h2>Certifications</h2>
            <ul>
              ${data.certifications.map((cert) => `<li>${cert}</li>`).join('')}
            </ul>
          </div>
        </body>
      </html>
    `;
  }
}
