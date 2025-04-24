import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import MarkdownIt from 'markdown-it';
import puppeteer from 'puppeteer';
import type { PDFOptions, CVTypeConfiguration } from '../shared/types/cv-types.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

interface StyleOptions extends PDFOptions {
  cvType?: 'federal' | 'state' | 'private';
  atsOptimized?: boolean;
  customClasses?: string[];
}

/**
 * Converts markdown content to HTML with enhanced features
 */
export function convertMarkdownToHtml(markdownContent: string): string {
  const md = new MarkdownIt({
    html: true,
    breaks: true,
    linkify: true,
    typographer: true
  });
  
  // Add custom renderer rules for ATS compatibility
  md.renderer.rules.heading_open = (tokens, idx) => {
    const token = tokens[idx];
    const level = parseInt(token.tag.slice(1), 10);
    // Use semantic classes for different heading levels
    return `<${token.tag} class="cv-heading-${level}">`;
  };
  
  return md.render(markdownContent);
}

/**
 * Loads and processes CSS based on CV type and options
 */
async function loadStylesheet(options: StyleOptions): Promise<string> {
  const cssPath = join(__dirname, '..', 'styles', 'pdf-styles.css');
  let css: string;
  
  try {
    css = await fs.readFile(cssPath, 'utf-8');
  } catch (error) {
    console.warn(`Could not load CSS from ${cssPath}. Using embedded styles.`);
    css = getEmbeddedStyles();
  }
  
  // Add CV type-specific classes
  if (options.cvType) {
    css += getCVTypeStyles(options.cvType);
  }
  
  // Add ATS-optimized styles if requested
  if (options.atsOptimized) {
    css += getATSStyles();
  }
  
  // Add custom classes if provided
  if (options.customClasses?.length) {
    css += getCustomClassStyles(options.customClasses);
  }
  
  return css;
}

/**
 * Applies styling to HTML content with enhanced options
 */
export async function applyHtmlStyling(
  htmlContent: string,
  options: StyleOptions
): Promise<string> {
  const css = await loadStylesheet(options);
  
  const styledHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${options.pdfTitle || 'CV Document'}</title>
      <style>
        ${css}
        @page {
          size: ${options.paperSize} ${options.orientation};
          margin: ${options.margins.top}in ${options.margins.right}in ${options.margins.bottom}in ${options.margins.left}in;
        }
        @media print {
          .page-break { page-break-after: always; }
          h1, h2, h3 { page-break-after: avoid; }
          li { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body class="${options.cvType || ''} ${options.atsOptimized ? 'ats-optimized' : ''}">
      ${htmlContent}
    </body>
    </html>
  `;
  
  return styledHtml;
}

/**
 * Enhanced PDF generation with sector-specific options
 */
export async function convertMarkdownToPdf(
  markdownContent: string,
  outputPath: string,
  options: Partial<StyleOptions> = {}
): Promise<string> {
  const pdfOptions: StyleOptions = {
    ...DEFAULT_PDF_OPTIONS,
    ...options,
    margins: {
      ...DEFAULT_PDF_OPTIONS.margins,
      ...(options.margins || {})
    }
  };
  
  try {
    const htmlContent = convertMarkdownToHtml(markdownContent);
    const styledHtml = await applyHtmlStyling(htmlContent, pdfOptions);
    
    await fs.mkdir(dirname(outputPath), { recursive: true });
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(styledHtml, { waitUntil: 'networkidle0' });
    
    // Configure header/footer if enabled
    const { headerTemplate, footerTemplate } = getHeaderFooterTemplates(pdfOptions);
    
    // Generate PDF with enhanced options
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
    
    await browser.close();
    return outputPath;
  } catch (error) {
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Helper functions
function getHeaderFooterTemplates(options: StyleOptions) {
  const headerTemplate = options.includeHeaderFooter && options.headerText
    ? `<div style="width: 100%; text-align: center; font-size: 8pt; font-family: ${options.fontFamily}; padding: 5px 0;">${options.headerText}</div>`
    : '';
    
  const footerTemplate = options.includeHeaderFooter && options.footerText
    ? `<div style="width: 100%; text-align: center; font-size: 8pt; font-family: ${options.fontFamily}; padding: 5px 0;">
        ${options.footerText} - <span class="pageNumber"></span> of <span class="totalPages"></span>
      </div>`
    : '';
    
  return { headerTemplate, footerTemplate };
}

function getEmbeddedStyles(): string {
  return `/* Embedded fallback styles */`;
}

function getCVTypeStyles(type: 'federal' | 'state' | 'private'): string {
  return `/* ${type}-specific styles */`;
}

function getATSStyles(): string {
  return `/* ATS-optimized styles */`;
}

function getCustomClassStyles(classes: string[]): string {
  return classes.map(cls => `.${cls} { /* Custom styles */ }`).join('\n');
}
