import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import MarkdownIt from 'markdown-it';
import puppeteer from 'puppeteer';
import type { PDFOptions } from '../types/cv-types.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Default PDF options for CV generation
 */
export const DEFAULT_PDF_OPTIONS: PDFOptions = {
  paperSize: 'Letter',
  margins: {
    top: 0.75,
    right: 0.75,
    bottom: 0.75,
    left: 0.75
  },
  fontFamily: 'Arial, sans-serif',
  fontSize: 11,
  includeHeaderFooter: false,
  orientation: 'portrait',
  pdfCreator: 'DZB CV Generator'
};

/**
 * Converts markdown content to HTML
 * @param markdownContent The markdown content to convert
 * @returns HTML content
 */
export function convertMarkdownToHtml(markdownContent: string): string {
  const md = new MarkdownIt({
    html: true,
    breaks: true,
    linkify: true,
    typographer: true
  });
  
  return md.render(markdownContent);
}

/**
 * Applies styling to HTML content
 * @param htmlContent The HTML content to style
 * @param options PDF styling options
 * @returns Styled HTML content
 */
export async function applyHtmlStyling(htmlContent: string, options: PDFOptions): Promise<string> {
  // Try to load default CSS
  let defaultCss = '';
  const cssPath = join(__dirname, '..', '..', 'src', 'styles', 'pdf-styles.css');
  
  try {
    defaultCss = await fs.readFile(cssPath, 'utf-8');
  } catch (error) {
    console.warn(`Could not load CSS from ${cssPath}. Using default inline styles.`);
    defaultCss = `
      body {
        font-family: ${options.fontFamily};
        font-size: ${options.fontSize}pt;
        line-height: 1.5;
        margin: 0;
        padding: 0;
      }
      h1 { font-size: 24pt; text-align: center; color: #1a5276; }
      h2 { font-size: 16pt; border-bottom: 1px solid #eaecee; color: #2e86c1; }
      h3 { font-size: 14pt; color: #3498db; }
      p { margin: 0.7em 0; }
      ul, ol { margin: 0.7em 0; padding-left: 2em; }
      li { margin: 0.3em 0; }
      a { color: #2980b9; text-decoration: none; }
      strong { font-weight: 600; color: #2c3e50; }
      .page-break { page-break-after: always; }
    `;
  }
  
  // Use custom CSS if provided
  const customCss = options.cssStylesheet || '';
  
  // Create full HTML document with styling
  const styledHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${options.pdfTitle || 'CV Document'}</title>
      <style>
        ${defaultCss}
        ${customCss}
        @page {
          size: ${options.paperSize} ${options.orientation};
          margin: ${options.margins.top}in ${options.margins.right}in ${options.margins.bottom}in ${options.margins.left}in;
        }
      </style>
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
  `;
  
  return styledHtml;
}

/**
 * Converts markdown content to PDF
 * @param markdownContent The markdown content to convert
 * @param outputPath The path to save the PDF to
 * @param options PDF options
 * @returns Path to the generated PDF
 */
export async function convertMarkdownToPdf(
  markdownContent: string,
  outputPath: string,
  options: Partial<PDFOptions> = {}
): Promise<string> {
  // Merge provided options with defaults
  const pdfOptions: PDFOptions = {
    ...DEFAULT_PDF_OPTIONS,
    ...options,
    margins: {
      ...DEFAULT_PDF_OPTIONS.margins,
      ...(options.margins || {})
    }
  };
  
  try {
    // Convert markdown to HTML
    const htmlContent = convertMarkdownToHtml(markdownContent);
    
    // Apply styling
    const styledHtml = await applyHtmlStyling(htmlContent, pdfOptions);
    
    // Ensure output directory exists
    await fs.mkdir(dirname(outputPath), { recursive: true });
    
    // Launch browser
    const browser = await puppeteer.launch({
      headless: true, // Use true instead of 'new' for compatibility
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    // Create new page
    const page = await browser.newPage();
    
    // Set content
    await page.setContent(styledHtml, { waitUntil: 'networkidle0' });
    
    // Configure header template if enabled
    const headerTemplate = pdfOptions.includeHeaderFooter && pdfOptions.headerText 
      ? `<div style="width: 100%; text-align: center; font-size: 8pt; font-family: ${pdfOptions.fontFamily}; padding: 5px 0;">${pdfOptions.headerText}</div>`
      : '';
    
    // Configure footer template if enabled
    const footerTemplate = pdfOptions.includeHeaderFooter && pdfOptions.footerText
      ? `<div style="width: 100%; text-align: center; font-size: 8pt; font-family: ${pdfOptions.fontFamily}; padding: 5px 0;">
          ${pdfOptions.footerText} - <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>`
      : '';
    
    // Generate PDF with configured options
    await page.pdf({
      path: outputPath,
      format: pdfOptions.paperSize,
      landscape: pdfOptions.orientation === 'landscape',
      margin: {
        top: `${pdfOptions.margins.top}in`,
        right: `${pdfOptions.margins.right}in`,
        bottom: `${pdfOptions.margins.bottom}in`,
        left: `${pdfOptions.margins.left}in`
      },
      printBackground: true,
      displayHeaderFooter: pdfOptions.includeHeaderFooter,
      headerTemplate,
      footerTemplate,
      preferCSSPageSize: true
    });
    
    // Close browser
    await browser.close();
    
    return outputPath;
  } catch (error) {
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Creates a directory for PDF files if it doesn't exist
 * @param dirPath Directory path
 */
export async function createPdfDirectory(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    throw new Error(`Failed to create PDF directory: ${error instanceof Error ? error.message : String(error)}`);
  }
}
