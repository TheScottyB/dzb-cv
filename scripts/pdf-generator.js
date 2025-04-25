import { promises as fs } from 'fs';
import { dirname } from 'path';
import MarkdownIt from 'markdown-it';

// Default PDF options
export const DEFAULT_PDF_OPTIONS = {
  paperSize: 'Letter',
  margins: {
    top: 0.75,
    right: 0.75,
    bottom: 0.75,
    left: 0.75
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
  customCss: ''
};

/**
 * Converts markdown content to HTML with enhanced features
 */
export function convertMarkdownToHtml(markdownContent) {
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
 */
async function applyHtmlStyling(htmlContent, options) {
  // Try to load external CSS
  let externalCss = '';
  try {
    externalCss = await fs.readFile('./styles/pdf-styles.css', 'utf-8');
  } catch (error) {
    console.log('Could not load external CSS. Using embedded styles.');
  }

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
            line-height: 1.5;
          }
        }
      </style>
    </head>
    <body>
      ${options.includeHeaderFooter ? `
        <div class="page-header">
          ${options.headerText || ''}
        </div>
      ` : ''}
      
      ${htmlContent}
      
      ${options.includeHeaderFooter ? `
        <div class="page-footer">
          ${options.footerText || ''}
        </div>
      ` : ''}
    </body>
    </html>
  `;
}

/**
 * Enhanced PDF generation with sector-specific options
 */
export async function convertMarkdownToPdf(
  markdownContent,
  outputPath,
  options = {}
) {
  const pdfOptions = {
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
    
    // For now, we'll just save the HTML file
    const htmlPath = outputPath.replace(/\.pdf$/, '.html');
    await fs.mkdir(dirname(htmlPath), { recursive: true });
    await fs.writeFile(htmlPath, styledHtml, 'utf-8');
    
    console.log(`Generated HTML file at: ${htmlPath}`);
    console.log('Please use your browser to print this HTML file to PDF with the following settings:');
    console.log('- Paper size: Letter');
    console.log('- Margins: 0.75 inches on all sides');
    console.log('- Print background colors and images');
    
    return htmlPath;
  } catch (error) {
    console.error('HTML generation error:', error);
    throw new Error(`HTML generation failed: ${error.message}`);
  }
}