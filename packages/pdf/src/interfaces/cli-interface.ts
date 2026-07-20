import { ChromePDFEngine, ChromePDFOptions, ChromePDFResult } from '../core/chrome-engine.js';
import type { CVData, PDFGenerationOptions } from '@dzb-cv/types';
import { readFileSync } from 'fs';
import { marked } from 'marked';

/** Print-optimized stylesheet for markdown-sourced CVs. */
const PRINT_CSS = `
  body { font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; color: #333;
         max-width: 210mm; margin: 0 auto; padding: 14mm 16mm; font-size: 10.5pt; line-height: 1.5; }
  h1 { font-size: 21pt; margin: 0 0 2pt; color: #1a1a1a; border-bottom: 2pt solid #2c5282; padding-bottom: 6pt; }
  h1 + p strong { font-size: 11.5pt; color: #2c5282; }
  h2 { font-size: 13pt; color: #2c5282; margin: 14pt 0 6pt; border-bottom: 0.75pt solid #ddd;
       padding-bottom: 3pt; letter-spacing: 0.03em; page-break-after: avoid; }
  p { margin: 4pt 0; }
  ul { margin: 4pt 0 8pt; padding-left: 16pt; }
  li { margin: 2pt 0; page-break-inside: avoid; }
  hr { border: none; margin: 6pt 0; }
  strong { color: #1a1a1a; }
  @media print { body { padding: 8mm 10mm; } }
`;

/** Convert a markdown file to a standalone print-ready HTML document. */
function markdownFileToHTML(filePath: string): string {
  const md = readFileSync(filePath, 'utf8');
  const body = marked.parse(md, { async: false }) as string;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${PRINT_CSS}</style></head><body>${body}</body></html>`;
}

export interface CLIPDFOptions extends Omit<ChromePDFOptions, 'htmlContent' | 'htmlPath'> {
  /** Input source - can be HTML file, HTML content, or CV data */
  input: string | CVData;
  /** Input type detection */
  inputType?: 'file' | 'html' | 'cvdata';
  /** Enable debug output */
  debug?: boolean;
  /** Template to use for CV data rendering */
  template?: string;
}

/**
 * CLI-focused PDF interface for developers
 * Provides full control over Chrome PDF generation with developer-friendly options
 */
export class CLIPDFInterface {
  private engine: ChromePDFEngine;

  constructor(tempDir?: string) {
    this.engine = new ChromePDFEngine(tempDir);
  }

  /**
   * Generate PDF with full CLI control and debugging
   */
  async generate(options: CLIPDFOptions): Promise<ChromePDFResult> {
    if (options.debug) {
      console.log('🔧 Chrome PDF CLI Generator');
      console.log('Chrome info:', this.engine.getInfo());
      console.log('Options:', JSON.stringify(options, null, 2));
    }

    try {
      const chromeOptions = await this.prepareChromeOptions(options);
      
      if (options.debug) {
        console.log('Chrome command options:', chromeOptions);
        console.log('🚀 Starting PDF generation...');
      }

      const result = await this.engine.generatePDF(chromeOptions);

      if (options.debug) {
        if (result.success) {
          console.log(`✅ PDF generated successfully in ${result.executionTime}ms`);
          console.log(`📄 Output: ${result.outputPath}`);
        } else {
          console.error(`❌ PDF generation failed: ${result.error}`);
        }
      }

      return result;

    } catch (error) {
      const errorResult: ChromePDFResult = {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };

      if (options.debug) {
        console.error('❌ CLI PDF Interface error:', errorResult.error);
      }

      return errorResult;
    }
  }

  /**
   * Generate PDF with single-page optimization (common CLI use case)
   */
  async generateSinglePage(options: Omit<CLIPDFOptions, 'scale'>): Promise<ChromePDFResult> {
    return this.generate({
      ...options,
      scale: 0.88, // Optimal single-page scaling
      virtualTimeBudget: 8000, // Extra time for single-page layout
      windowSize: '1920,1080'
    });
  }

  /**
   * Generate PDF with high-quality settings
   */
  async generateHighQuality(options: CLIPDFOptions): Promise<ChromePDFResult> {
    return this.generate({
      ...options,
      virtualTimeBudget: 10000,
      windowSize: '1920,1080',
      customFlags: [
        '--disable-images=false', // Enable images for high quality
        '--enable-javascript', // Enable JS for dynamic content
        ...options.customFlags || []
      ]
    });
  }

  /**
   * Batch generate multiple PDFs (CLI workflow)
   */
  async generateBatch(
    items: Array<{ input: string | CVData; outputPath: string }>,
    commonOptions?: Partial<CLIPDFOptions>
  ): Promise<ChromePDFResult[]> {
    const results: ChromePDFResult[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (commonOptions?.debug) {
        console.log(`🔄 Processing batch item ${i + 1}/${items.length}: ${item?.outputPath || 'unknown'}`);
      }

      if (!item) {
        console.error(`❌ Batch item ${i + 1} is undefined`);
        continue;
      }

      const result = await this.generate({
        ...commonOptions,
        input: item.input,
        outputPath: item.outputPath
      } as CLIPDFOptions);

      results.push(result);

      if (commonOptions?.debug && result.success) {
        console.log(`✅ Batch item ${i + 1} completed`);
      }
    }

    if (commonOptions?.debug) {
      const successful = results.filter(r => r.success).length;
      console.log(`🎉 Batch complete: ${successful}/${results.length} successful`);
    }

    return results;
  }

  /**
   * Prepare Chrome options from CLI options
   */
  private async prepareChromeOptions(options: CLIPDFOptions): Promise<ChromePDFOptions> {
    const inputType = options.inputType || this.detectInputType(options.input);

    switch (inputType) {
      case 'file': {
        const filePath = options.input as string;
        // Markdown files must be converted to styled HTML before Chrome
        // prints them, otherwise the PDF is raw markdown as plain text.
        if (/\.(md|markdown)$/i.test(filePath)) {
          return {
            htmlContent: markdownFileToHTML(filePath),
            outputPath: options.outputPath,
            windowSize: options.windowSize || '1920,1080',
            virtualTimeBudget: options.virtualTimeBudget || 5000,
            printMargins: options.printMargins ?? false,
            scale: options.scale ?? 1.0,
            paperSize: options.paperSize ?? 'Letter',
            customFlags: options.customFlags ?? [],
            timeout: options.timeout ?? 30000
          };
        }
        return {
          htmlPath: options.input as string,
          outputPath: options.outputPath,
          windowSize: options.windowSize || '1920,1080',
          virtualTimeBudget: options.virtualTimeBudget || 5000,
          printMargins: options.printMargins ?? false,
          scale: options.scale ?? 1.0,
          paperSize: options.paperSize ?? 'Letter',
          customFlags: options.customFlags ?? [],
          timeout: options.timeout ?? 30000
        };
      }

      case 'html':
        return {
          htmlContent: options.input as string,
          outputPath: options.outputPath,
          windowSize: options.windowSize || '1920,1080',
          virtualTimeBudget: options.virtualTimeBudget || 5000,
          printMargins: options.printMargins ?? false,
          scale: options.scale ?? 1.0,
          paperSize: options.paperSize ?? 'Letter',
          customFlags: options.customFlags ?? [],
          timeout: options.timeout ?? 30000
        };

      case 'cvdata':
        const htmlContent = await this.renderCVDataToHTML(
          options.input as CVData, 
          options.template
        );
        return {
          htmlContent,
          outputPath: options.outputPath,
          windowSize: options.windowSize || '1920,1080',
          virtualTimeBudget: options.virtualTimeBudget || 5000,
          printMargins: options.printMargins ?? false,
          scale: options.scale ?? 1.0,
          paperSize: options.paperSize ?? 'Letter',
          customFlags: options.customFlags ?? [],
          timeout: options.timeout ?? 30000
        };

      default:
        throw new Error(`Unsupported input type: ${inputType}`);
    }
  }

  /**
   * Detect input type from content
   */
  private detectInputType(input: string | CVData): 'file' | 'html' | 'cvdata' {
    if (typeof input === 'object') {
      return 'cvdata';
    }

    const inputStr = input as string;
    
    // Check if it's a file path
    if (inputStr.includes('.html') || inputStr.includes('.htm')) {
      return 'file';
    }

    // Check if it's HTML content
    if (inputStr.trim().startsWith('<') && inputStr.includes('</')) {
      return 'html';
    }

    // Default to file path
    return 'file';
  }

  /**
   * Render CV data to HTML using templates
   */
  private async renderCVDataToHTML(cvData: CVData, template?: string): Promise<string> {
    // This would integrate with the template system
    // For now, return a basic HTML structure
    const templateName = template || 'basic';
    
    // Import template renderer (would be implemented)
    // const renderer = await import(`../templates/${templateName}-renderer.js`);
    // return renderer.render(cvData);
    
    // Placeholder implementation
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${cvData.personalInfo?.name?.full || 'CV'}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0.5in; line-height: 1.4; }
        h1 { color: #2c3e50; margin-bottom: 0.5em; }
        h2 { color: #34495e; border-bottom: 1px solid #ecf0f1; padding-bottom: 0.3em; }
        .contact { margin-bottom: 1em; }
      </style>
    </head>
    <body>
      <h1>${cvData.personalInfo?.name?.full || 'Curriculum Vitae'}</h1>
      <div class="contact">
        ${cvData.personalInfo?.contact?.email || ''}
        ${cvData.personalInfo?.contact?.phone ? ' | ' + cvData.personalInfo.contact.phone : ''}
      </div>
      <!-- More CV content would be rendered here -->
    </body>
    </html>
    `;
  }

  /**
   * Get Chrome engine info for debugging
   */
  getEngineInfo() {
    return this.engine.getInfo();
  }
}