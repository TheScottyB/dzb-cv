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
  /** Force content to fit on a single page */
  singlePage?: boolean;
  /** Scale factor for single-page layout (0.1 to 1.0) */
  scale?: number;
  /** Minimum font size to maintain readability (in pt) */
  minFontSize?: number;
  /** Line height adjustment for single-page layout */
  lineHeight?: number;
  /** Use LLM-optimized content for generation */
  llmOptimized?: boolean;
  /** Pre-optimized content from LLM processing */
  optimizedContent?: string;
}

/**
 * Abstract base class for PDF generation
 */
export abstract class PDFGenerator {
  abstract generate(data: CVData, options?: Partial<PDFGenerationOptions>): Promise<Buffer>;
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
  protected abstract generateHTML(data: CVData, options?: Partial<PDFGenerationOptions>): string;
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
      const html = this.generateHTML(data, options);
      await page.setContent(html);

      // Apply single-page optimizations if requested
      if (options?.singlePage) {
        await this.optimizeForSinglePage(page, options);
      }

      const pdfOptions = {
        format: (options?.paperSize || 'letter') as PaperFormat,
        margin: options?.margins || { top: '1in', right: '1in', bottom: '1in', left: '1in' },
        printBackground: true,
        displayHeaderFooter: options?.includeHeaderFooter || false,
        headerTemplate: options?.headerText || '',
        footerTemplate: options?.footerText || '',
        landscape: options?.orientation === 'landscape',
        ...(options?.singlePage && {
          preferCSSPageSize: true,
        }),
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
    options?: Partial<PDFGenerationOptions>
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
    options?: Partial<PDFGenerationOptions>
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
    options?: Partial<PDFGenerationOptions>
  ): Promise<string> {
    const templateContent = readFileSync(templatePath, 'utf-8');
    const template = handlebars.compile(templateContent);
    const html = template(data);
    const result = await this.generateFromHTML(html, outputPath, options);
    return result;
  }

  protected generateHTML(data: CVData, options?: Partial<PDFGenerationOptions>): string {
    const singlePageStyles = this.getSinglePageStyles(options);
    
    // If LLM optimized content is provided, use it directly
    if (options?.llmOptimized && options?.optimizedContent) {
      return this.generateOptimizedHTML(data, options.optimizedContent, options);
    }
    
    // Basic HTML template
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${data.personalInfo.name.full} - CV</title>
          <style>
            body { 
              font-family: ${options?.fontFamily || 'Arial, sans-serif'}; 
              margin: ${options?.singlePage ? '20px' : '40px'};
              font-size: ${options?.singlePage ? '11pt' : '12pt'};
              line-height: ${options?.lineHeight || (options?.singlePage ? '1.3' : '1.5')};
            }
            h1 { 
              color: #333; 
              font-size: ${options?.singlePage ? '18pt' : '24pt'};
              margin: ${options?.singlePage ? '0 0 8px 0' : '0 0 16px 0'};
            }
            h2 {
              font-size: ${options?.singlePage ? '14pt' : '18pt'};
              margin: ${options?.singlePage ? '12px 0 6px 0' : '20px 0 10px 0'};
              color: #444;
            }
            h3 {
              font-size: ${options?.singlePage ? '12pt' : '14pt'};
              margin: ${options?.singlePage ? '6px 0 3px 0' : '10px 0 5px 0'};
            }
            .contact-info { 
              margin-bottom: ${options?.singlePage ? '12px' : '20px'};
              font-size: ${options?.singlePage ? '10pt' : '12pt'};
            }
            .section { 
              margin-bottom: ${options?.singlePage ? '15px' : '30px'};
            }
            ul {
              margin: ${options?.singlePage ? '4px 0' : '8px 0'};
              padding-left: ${options?.singlePage ? '18px' : '20px'};
            }
            li {
              margin: ${options?.singlePage ? '2px 0' : '4px 0'};
            }
            p {
              margin: ${options?.singlePage ? '3px 0' : '6px 0'};
            }
            ${singlePageStyles}
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
              ?.map(
                (exp) => `
              <div>
                <h3>${exp.title} at ${exp.company}</h3>
                <p>${exp.startDate} - ${exp.endDate || 'Present'}</p>
                <ul>
                  ${exp.responsibilities?.map((r) => `<li>${r}</li>`).join('') || ''}
                </ul>
              </div>
            `
              )
              .join('') || ''}
          </div>
          
          <div class="section">
            <h2>Education</h2>
            ${data.education
              ?.map(
                (edu) => `
              <div>
                <h3>${edu.degree} - ${edu.institution}</h3>
                <p>${edu.year}</p>
              </div>
            `
              )
              .join('') || ''}
          </div>
          
          <div class="section">
            <h2>Skills</h2>
            <ul>
              ${data.skills ? (
                Array.isArray(data.skills) 
                  ? data.skills.map((skill) => `<li>${typeof skill === 'string' ? skill : skill.name || 'Skill'}</li>`).join('') 
                  : ''
              ) : ''}
            </ul>
          </div>
          
          <div class="section">
            <h2>Certifications</h2>
            <ul>
              ${data.certifications?.map((cert) => `<li>${cert}</li>`).join('') || ''}
            </ul>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate additional CSS styles for single-page layout
   */
  private getSinglePageStyles(options?: Partial<PDFGenerationOptions>): string {
    if (!options?.singlePage) {
      return '';
    }

    const scale = options.scale || 0.9;
    const minFontSize = options.minFontSize || 8;
    
    return `
      /* Single-page specific optimizations */
      @page {
        size: ${options.paperSize || 'letter'};
        margin: 0.5in;
      }
      
      body {
        transform: scale(${scale});
        transform-origin: top left;
        width: ${100 / scale}%;
      }
      
      /* Prevent page breaks */
      * {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      
      /* Compact list styles */
      ul li {
        line-height: 1.2;
      }
      
      /* Ensure minimum font size for readability */
      body, p, li {
        font-size: max(${minFontSize}pt, ${options.singlePage ? '10pt' : '12pt'});
      }
      
      /* Hide elements that might cause overflow */
      .page-break {
        display: none;
      }
      
      /* Compact spacing for sections */
      .section:last-child {
        margin-bottom: 8px;
      }
    `;
  }

  /**
   * Apply runtime optimizations for single-page layout
   */
  private async optimizeForSinglePage(
    page: any, 
    options?: Partial<PDFGenerationOptions>
  ): Promise<void> {
    // Measure content height and adjust if necessary
    const contentMetrics = await page.evaluate(() => {
      const body = document.body;
      return {
        scrollHeight: body.scrollHeight,
        clientHeight: body.clientHeight,
        scrollWidth: body.scrollWidth
      };
    });

    // Get page dimensions (approximate for letter size in pixels at 96 DPI)
    const paperSize = options?.paperSize || 'letter';
    const pageHeight = paperSize === 'A4' ? 1123 : 1056; // Approx pixels at 96 DPI
    const margins = this.parseMargins(options?.margins);
    const availableHeight = pageHeight - margins.top - margins.bottom;

    console.log(`Content height: ${contentMetrics.scrollHeight}px, Available: ${availableHeight}px`);

    // If content is too tall, apply additional compression
    if (contentMetrics.scrollHeight > availableHeight) {
      const compressionRatio = availableHeight / contentMetrics.scrollHeight;
      const adjustedScale = Math.min(compressionRatio * 0.95, options?.scale || 0.9);
      
      console.log(`Applying compression: ${adjustedScale}`);
      
      await page.addStyleTag({
        content: `
          body {
            transform: scale(${adjustedScale}) !important;
            transform-origin: top left !important;
            width: ${100 / adjustedScale}% !important;
          }
          
          /* Additional compression for very long content */
          h1 { font-size: 16pt !important; margin: 0 0 6px 0 !important; }
          h2 { font-size: 13pt !important; margin: 10px 0 4px 0 !important; }
          h3 { font-size: 11pt !important; margin: 4px 0 2px 0 !important; }
          p, li { font-size: 9pt !important; margin: 1px 0 !important; }
          ul { margin: 2px 0 !important; padding-left: 15px !important; }
          .section { margin-bottom: 10px !important; }
        `
      });
    }
  }

  /**
   * Parse margin values to pixels (approximate)
   */
  private parseMargins(margins?: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  }): { top: number; right: number; bottom: number; left: number } {
    const defaultMargin = 72; // 1 inch = 72 pixels at 96 DPI
    
    const parseMargin = (margin: string): number => {
      if (!margin) return defaultMargin;
      const value = parseFloat(margin);
      if (margin.includes('in')) {
        return value * 96; // 96 pixels per inch
      } else if (margin.includes('mm')) {
        return value * 3.78; // approx pixels per mm
      } else if (margin.includes('pt')) {
        return value * 1.33; // approx pixels per point
      }
      return defaultMargin;
    };

    return {
      top: parseMargin(margins?.top || '1in'),
      right: parseMargin(margins?.right || '1in'),
      bottom: parseMargin(margins?.bottom || '1in'),
      left: parseMargin(margins?.left || '1in')
    };
  }

  /**
   * Generate HTML using LLM-optimized content
   */
  private generateOptimizedHTML(
    data: CVData, 
    optimizedContent: string, 
    options?: Partial<PDFGenerationOptions>
  ): string {
    const singlePageStyles = this.getSinglePageStyles(options);
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${data.personalInfo.name.full} - AI-Optimized CV</title>
          <style>
            body { 
              font-family: ${options?.fontFamily || 'Arial, sans-serif'}; 
              margin: ${options?.singlePage ? '20px' : '40px'};
              font-size: ${options?.singlePage ? '11pt' : '12pt'};
              line-height: ${options?.lineHeight || (options?.singlePage ? '1.3' : '1.5')};
            }
            h1 { 
              color: #333; 
              font-size: ${options?.singlePage ? '18pt' : '24pt'};
              margin: ${options?.singlePage ? '0 0 8px 0' : '0 0 16px 0'};
            }
            h2 {
              font-size: ${options?.singlePage ? '14pt' : '18pt'};
              margin: ${options?.singlePage ? '12px 0 6px 0' : '20px 0 10px 0'};
              color: #444;
            }
            h3 {
              font-size: ${options?.singlePage ? '12pt' : '14pt'};
              margin: ${options?.singlePage ? '6px 0 3px 0' : '10px 0 5px 0'};
            }
            .contact-info { 
              margin-bottom: ${options?.singlePage ? '12px' : '20px'};
              font-size: ${options?.singlePage ? '10pt' : '12pt'};
            }
            .section { 
              margin-bottom: ${options?.singlePage ? '15px' : '30px'};
            }
            ul {
              margin: ${options?.singlePage ? '4px 0' : '8px 0'};
              padding-left: ${options?.singlePage ? '18px' : '20px'};
            }
            li {
              margin: ${options?.singlePage ? '2px 0' : '4px 0'};
            }
            p {
              margin: ${options?.singlePage ? '3px 0' : '6px 0'};
            }
            .llm-optimized {
              white-space: pre-wrap;
              font-family: inherit;
            }
            ${singlePageStyles}
          </style>
        </head>
        <body>
          <div class="llm-optimized">
            ${this.formatOptimizedContent(optimizedContent)}
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Format LLM-optimized content for HTML display
   */
  private formatOptimizedContent(content: string): string {
    // Basic formatting - convert newlines to proper HTML structure
    return content
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>');
  }
}
