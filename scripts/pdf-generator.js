import { promises as fs } from 'fs';
import { dirname } from 'path';
import MarkdownIt from 'markdown-it';
import puppeteer from 'puppeteer';

// Default PDF options
export const DEFAULT_PDF_OPTIONS = {
  paperSize: 'Letter',
  margins: {
    top: 0.75,
    right: 0.75,
    bottom: 0.75,
    left: 0.75,
  },
  fontFamily: 'Georgia, serif',
  fontSize: 11,
  includeHeaderFooter: true,
  headerText: '',
  footerText: '',
  orientation: 'portrait',
  pdfTitle: '',
  pdfAuthor: '',
  pdfCreator: '',
  customCss: '',
  singlePage: false,
  lineHeight: 1.5,
};

/**
 * Converts markdown content to HTML with enhanced features
 */
export function convertMarkdownToHtml(markdownContent) {
  const md = new MarkdownIt({
    html: true,
    breaks: true,
    linkify: true,
    typographer: true,
  });

  return md.render(markdownContent);
}

/**
 * Applies styling to HTML content
 */
async function applyHtmlStyling(htmlContent, options) {
  // Try to load external CSS
  let externalCss = '';
  try {
    externalCss = await fs.readFile('./styles/pdf-styles.css', 'utf-8');
  } catch (error) {
    console.log('Could not load external CSS. Using embedded styles.');
  }

  // Generate single-page CSS if enabled
  const singlePageCss = options.singlePage ? `
    /* Single-page optimizations */
    body {
      font-size: ${options.fontSize || 9}pt !important;
      line-height: ${options.lineHeight || 1.2} !important;
      margin: 0 !important;
      padding: 0.25in !important;
    }
    h1 {
      font-size: 16pt !important;
      margin: 0.2em 0 !important;
    }
    h2 {
      font-size: 13pt !important;
      margin: 0.3em 0 0.1em 0 !important;
    }
    h3 {
      font-size: 11pt !important;
      margin: 0.2em 0 0.1em 0 !important;
    }
    p {
      margin: 0.1em 0 !important;
    }
    ul, ol {
      margin: 0.2em 0 !important;
      padding-left: 1em !important;
    }
    li {
      margin: 0.05em 0 !important;
      line-height: ${options.lineHeight || 1.2} !important;
    }
    .page-break {
      display: none !important;
    }
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${options.pdfTitle || 'Generated Document'}</title>
      <style>
        ${externalCss}
        ${options.customCss || ''}
        @media print {
          @page {
            size: ${options.paperSize} ${options.orientation};
            margin: ${options.margins.top}in ${options.margins.right}in ${options.margins.bottom}in ${options.margins.left}in;
          }
          body {
            font-family: ${options.fontFamily};
            font-size: ${options.fontSize}pt;
            line-height: ${options.lineHeight || 1.5};
          }
        }
        ${singlePageCss}
      </style>
    </head>
    <body>
      ${
        options.includeHeaderFooter
          ? `
        <div class="page-header">
          ${options.headerText || ''}
        </div>
      `
          : ''
      }
      
      ${htmlContent}
      
      ${
        options.includeHeaderFooter
          ? `
        <div class="page-footer">
          ${options.footerText || ''}
        </div>
      `
          : ''
      }
    </body>
    </html>
  `;
}

/**
 * Enhanced PDF generation with automated Puppeteer-based conversion
 */
export async function convertMarkdownToPdf(markdownContent, outputPath, options = {}) {
  const pdfOptions = {
    ...DEFAULT_PDF_OPTIONS,
    ...options,
    margins: {
      ...DEFAULT_PDF_OPTIONS.margins,
      ...(options.margins || {}),
    },
  };

  let browser;
  try {
    const htmlContent = convertMarkdownToHtml(markdownContent);
    const styledHtml = await applyHtmlStyling(htmlContent, pdfOptions);

    // Create output directory
    await fs.mkdir(dirname(outputPath), { recursive: true });

    // Launch Puppeteer browser
    console.log('Launching browser for PDF generation...');
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();
    
    // Set viewport for consistent rendering
    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 1,
    });

    // Set HTML content
    await page.setContent(styledHtml, {
      waitUntil: ['load', 'networkidle0'],
    });

    // Configure PDF options for Puppeteer
    const puppeteerPdfOptions = {
      path: outputPath,
      format: pdfOptions.paperSize,
      landscape: pdfOptions.orientation === 'landscape',
      margin: {
        top: `${pdfOptions.margins.top}in`,
        right: `${pdfOptions.margins.right}in`,
        bottom: `${pdfOptions.margins.bottom}in`,
        left: `${pdfOptions.margins.left}in`,
      },
      printBackground: true,
      displayHeaderFooter: pdfOptions.includeHeaderFooter,
      headerTemplate: pdfOptions.includeHeaderFooter ? `<div style="font-size:10px; width:100%; text-align:center;">${pdfOptions.headerText || ''}</div>` : '',
      footerTemplate: pdfOptions.includeHeaderFooter ? `<div style="font-size:10px; width:100%; text-align:center;">${pdfOptions.footerText || ''}</div>` : '',
      preferCSSPageSize: true,
    };

    // Add single-page specific options
    if (pdfOptions.singlePage) {
      puppeteerPdfOptions.pageRanges = '1';
      console.log('Applying single-page constraints...');
    }

    // Generate PDF
    console.log(`Generating PDF: ${outputPath}`);
    await page.pdf(puppeteerPdfOptions);

    console.log(`✓ Successfully generated PDF: ${outputPath}`);
    if (pdfOptions.singlePage) {
      console.log('✓ Single-page formatting applied automatically');
    }

    return outputPath;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error(`PDF generation failed: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
