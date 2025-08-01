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
      
      // Enhanced HTML with single-page CSS if needed
      const enhancedHTML = this.enhanceHTMLForSinglePage(html, options);
      await page.setContent(enhancedHTML);

      const pdfOptions = {
        format: (options?.format?.toLowerCase() || 'letter') as PaperFormat,
        margin: options?.margin || { top: '1in', right: '1in', bottom: '1in', left: '1in' },
        printBackground: true,
        displayHeaderFooter: options?.includeHeaderFooter || false,
        headerTemplate: options?.headerText || '',
        footerTemplate: options?.footerText || '',
        landscape: options?.orientation === 'landscape',
        ...(options?.scale && { scale: options.scale }),
        ...(options?.singlePage && { 
          // Additional options for single page
          preferCSSPageSize: true,
        }),
      };

      // If single page is requested, we may need to adjust scaling
      if (options?.singlePage) {
        await this.optimizeForSinglePage(page, options);
      }

      const pdfBuffer = await page.pdf(pdfOptions);
      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  private enhanceHTMLForSinglePage(html: string, options?: PDFGenerationOptions): string {
    if (!options?.singlePage) {
      return html;
    }

    // Add single-page specific CSS
    const singlePageCSS = `
      <style>
        /* Single Page Optimization */
        @page {
          size: ${options.format || 'letter'};
          margin: ${this.formatMargins(options.margin)};
        }
        
        body {
          font-size: ${options.scale ? `${Math.max(0.7, options.scale)}em` : '0.85em'};
          line-height: 1.3;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
        
        h1 {
          font-size: 1.8em;
          margin: 0 0 8px 0;
        }
        
        h2 {
          font-size: 1.3em;
          margin: 12px 0 6px 0;
        }
        
        h3 {
          font-size: 1.1em;
          margin: 8px 0 4px 0;
        }
        
        p, li {
          font-size: 0.95em;
          margin: 3px 0;
        }
        
        ul, ol {
          margin: 4px 0;
          padding-left: 15px;
        }
        
        .section {
          margin-bottom: 12px;
        }
        
        /* Prevent page breaks */
        * {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        /* Compact spacing for single page */
        .compact {
          margin: 2px 0;
          padding: 1px 0;
        }
        
        /* Hide elements that take too much space if needed */
        .hide-on-single-page {
          display: none;
        }
      </style>
    `;

    // Insert the CSS into the HTML
    if (html.includes('<head>')) {
      return html.replace('</head>', `${singlePageCSS}</head>`);
    } else if (html.includes('<html>')) {
      return html.replace('<html>', `<html><head>${singlePageCSS}</head>`);
    } else {
      return `<html><head>${singlePageCSS}</head><body>${html}</body></html>`;
    }
  }

  private async optimizeForSinglePage(page: any, options?: PDFGenerationOptions): Promise<void> {
    // Measure content height and adjust if necessary
    const contentHeight = await page.evaluate(() => {
      return document.body.scrollHeight;
    });

    // Get page dimensions (approximate for letter size)
    const pageHeight = options?.format === 'A4' ? 842 : 792; // Points
    const margins = options?.margin;
    const topMargin = this.parseMargin(margins?.top) || 72; // 1 inch default
    const bottomMargin = this.parseMargin(margins?.bottom) || 72;
    const availableHeight = pageHeight - topMargin - bottomMargin;

    // If content is too tall, inject additional compression styles
    if (contentHeight > availableHeight) {
      const compressionRatio = availableHeight / contentHeight;
      
      await page.addStyleTag({
        content: `
          body {
            transform: scale(${Math.min(compressionRatio * 0.95, 1)});
            transform-origin: top left;
          }
          
          /* Additional compression for overly long content */
          .compress {
            font-size: 0.75em;
            line-height: 1.2;
            margin: 1px 0;
          }
          
          h1 { font-size: 1.5em; margin: 0 0 4px 0; }
          h2 { font-size: 1.2em; margin: 8px 0 4px 0; }
          h3 { font-size: 1.05em; margin: 6px 0 2px 0; }
          p, li { font-size: 0.8em; margin: 1px 0; }
          ul { margin: 2px 0; padding-left: 12px; }
        `
      });
    }
  }

  private formatMargins(margin?: PDFGenerationOptions['margin']): string {
    if (!margin) return '0.75in';
    
    const top = margin.top || '0.75in';
    const right = margin.right || '0.75in';
    const bottom = margin.bottom || '0.75in';
    const left = margin.left || '0.75in';
    
    return `${top} ${right} ${bottom} ${left}`;
  }

  private parseMargin(margin?: string | number): number {
    if (typeof margin === 'number') return margin;
    if (!margin) return 72; // 1 inch default
    
    // Convert common units to points
    if (margin.includes('in')) {
      return parseFloat(margin) * 72;
    } else if (margin.includes('mm')) {
      return parseFloat(margin) * 2.834;
    } else if (margin.includes('pt')) {
      return parseFloat(margin);
    }
    
    return 72; // Default
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
