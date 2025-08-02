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
    @page {
      size: ${options.paperSize} ${options.orientation};
      margin: 0.4in;
    }
    
    body {
      font-size: ${options.fontSize || 9}pt !important;
      line-height: ${options.lineHeight || 1.15} !important;
      margin: 0 !important;
      padding: 0.2in !important;
      transform: scale(0.8);
      transform-origin: top left;
      width: 125%;
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
      overflow: hidden !important;
    }
    
    h1 {
      font-size: 14pt !important;
      margin: 0 0 4px 0 !important;
      line-height: 1.1 !important;
    }
    h2 {
      font-size: 12pt !important;
      margin: 8px 0 3px 0 !important;
      line-height: 1.1 !important;
    }
    h3 {
      font-size: 10pt !important;
      margin: 4px 0 2px 0 !important;
      line-height: 1.1 !important;
    }
    p {
      margin: 1px 0 !important;
      font-size: 9pt !important;
      line-height: 1.15 !important;
    }
    ul, ol {
      margin: 2px 0 !important;
      padding-left: 12px !important;
    }
    li {
      margin: 0.5px 0 !important;
      line-height: 1.15 !important;
      font-size: 9pt !important;
    }
    .page-break {
      display: none !important;
    }
    
    /* Compact sections */
    .section {
      margin-bottom: 8px !important;
    }
    
    .section:last-child {
      margin-bottom: 4px !important;
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
