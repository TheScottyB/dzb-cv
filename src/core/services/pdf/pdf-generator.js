import puppeteer from 'puppeteer';
import { marked } from 'marked';
import { readFileSync } from 'fs';
import handlebars from 'handlebars';
/**
 * Abstract base class for PDF generation
 */
export class PDFGenerator {
}
/**
 * Default implementation of PDF Generator
 */
export class DefaultPDFGenerator extends PDFGenerator {
    async generate(data, options) {
        // Template validation: fail fast for unknown types
        if (options?.template &&
            !['default', 'minimal', 'federal', 'academic'].includes(options.template)) {
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
                format: (options?.paperSize || 'letter'),
                margin: options?.singlePage
                    ? { top: '0.4in', right: '0.4in', bottom: '0.4in', left: '0.4in' }
                    : (options?.margins || { top: '1in', right: '1in', bottom: '1in', left: '1in' }),
                printBackground: true,
                displayHeaderFooter: options?.includeHeaderFooter || false,
                headerTemplate: options?.headerText || '',
                footerTemplate: options?.footerText || '',
                landscape: options?.orientation === 'landscape',
                ...(options?.singlePage && {
                    preferCSSPageSize: true,
                    pageRanges: '1', // Force single page
                }),
            };
            const pdfBuffer = await page.pdf(pdfOptions);
            return Buffer.from(pdfBuffer);
        }
        finally {
            await browser.close();
        }
    }
    async generateFromMarkdown(markdown, outputPath, options) {
        const fs = await import('fs');
        const path = await import('path');
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        const html = await marked(markdown);
        const result = await this.generateFromHTML(html, outputPath, options);
        return result;
    }
    async generateFromHTML(html, outputPath, options) {
        const fs = await import('fs');
        const path = await import('path');
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        const browser = await puppeteer.launch();
        try {
            const page = await browser.newPage();
            await page.setContent(html);
            const pdfOptions = {
                path: outputPath,
                format: (options?.paperSize || 'letter'),
                margin: options?.margins || { top: '1in', right: '1in', bottom: '1in', left: '1in' },
                printBackground: true,
                displayHeaderFooter: options?.includeHeaderFooter || false,
                headerTemplate: options?.headerText || '',
                footerTemplate: options?.footerText || '',
                landscape: options?.orientation === 'landscape',
            };
            await page.pdf(pdfOptions);
            return outputPath;
        }
        finally {
            await browser.close();
        }
    }
    async generateFromTemplate(templatePath, data, outputPath, options) {
        const templateContent = readFileSync(templatePath, 'utf-8');
        const template = handlebars.compile(templateContent);
        const html = template(data);
        const result = await this.generateFromHTML(html, outputPath, options);
        return result;
    }
    generateHTML(data, options) {
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
            ?.map((exp) => `
              <div>
                <h3>${exp.title} at ${exp.company}</h3>
                <p>${exp.startDate} - ${exp.endDate || 'Present'}</p>
                <ul>
                  ${exp.responsibilities?.map((r) => `<li>${r}</li>`).join('') || ''}
                </ul>
              </div>
            `)
            .join('') || ''}
          </div>
          
          <div class="section">
            <h2>Education</h2>
            ${data.education
            ?.map((edu) => `
              <div>
                <h3>${edu.degree} - ${edu.institution}</h3>
                <p>${edu.year}</p>
              </div>
            `)
            .join('') || ''}
          </div>
          
          <div class="section">
            <h2>Skills</h2>
            <ul>
              ${data.skills ? (Array.isArray(data.skills)
            ? data.skills.map((skill) => `<li>${typeof skill === 'string' ? skill : skill.name || 'Skill'}</li>`).join('')
            : '') : ''}
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
    getSinglePageStyles(options) {
        if (!options?.singlePage) {
            return '';
        }
        const scale = options.scale || 0.88; // Optimized for readability based on testing
        const minFontSize = options.minFontSize || 9;
        return `
      /* Single-page specific optimizations */
      @page {
        size: ${options.paperSize || 'letter'};
        margin: 0.4in; /* Reduced margins */
      }
      
      body {
        transform: scale(${scale});
        transform-origin: top left;
        width: ${100 / scale}%;
        height: ${100 / scale}%;
        overflow: hidden; /* Prevent content from spilling over */
      }
      
      /* Prevent page breaks */
      * {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        page-break-after: avoid !important;
        page-break-before: avoid !important;
      }
      
      /* Force single page layout */
      html, body {
        height: 100vh !important;
        max-height: 100vh !important;
      }
      
      /* Aggressive compression for headers */
      h1 {
        font-size: max(14pt, ${minFontSize + 4}pt) !important;
        margin: 0 0 4px 0 !important;
        line-height: 1.1 !important;
      }
      
      h2 {
        font-size: max(12pt, ${minFontSize + 2}pt) !important;
        margin: 8px 0 3px 0 !important;
        line-height: 1.1 !important;
      }
      
      h3 {
        font-size: max(10pt, ${minFontSize + 1}pt) !important;
        margin: 4px 0 2px 0 !important;
        line-height: 1.1 !important;
      }
      
      /* Compact text and list styles */
      p, li {
        font-size: max(${minFontSize}pt, 9pt) !important;
        line-height: 1.15 !important;
        margin: 1px 0 !important;
      }
      
      ul {
        margin: 2px 0 !important;
        padding-left: 12px !important;
      }
      
      ul li {
        line-height: 1.15 !important;
        margin: 0.5px 0 !important;
      }
      
      /* Compact section spacing */
      .section {
        margin-bottom: 8px !important;
      }
      
      .section:last-child {
        margin-bottom: 4px !important;
      }
      
      .contact-info {
        margin-bottom: 6px !important;
        font-size: max(${minFontSize}pt, 9pt) !important;
      }
      
      /* Hide elements that might cause overflow */
      .page-break {
        display: none !important;
      }
      
      /* Ensure content fits within viewport */
      div, section, article {
        max-height: none !important;
      }
    `;
    }
    /**
     * Apply runtime optimizations for single-page layout
     */
    async optimizeForSinglePage(page, options) {
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
    parseMargins(margins) {
        const defaultMargin = 72; // 1 inch = 72 pixels at 96 DPI
        const parseMargin = (margin) => {
            if (!margin)
                return defaultMargin;
            const value = parseFloat(margin);
            if (margin.includes('in')) {
                return value * 96; // 96 pixels per inch
            }
            else if (margin.includes('mm')) {
                return value * 3.78; // approx pixels per mm
            }
            else if (margin.includes('pt')) {
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
    generateOptimizedHTML(data, optimizedContent, options) {
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
    formatOptimizedContent(content) {
        // Basic formatting - convert newlines to proper HTML structure
        return content
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^/, '<p>')
            .replace(/$/, '</p>');
    }
}
//# sourceMappingURL=pdf-generator.js.map