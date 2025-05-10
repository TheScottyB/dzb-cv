import { promises as fs } from 'fs';
import MarkdownIt from 'markdown-it';
import type { PDFOptions } from '../types/cv-types';

// Define a type that ensures margins are always defined
type PDFOptionsWithRequiredMargins = Omit<PDFOptions, 'margins'> & {
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
};

export const DEFAULT_PDF_OPTIONS: PDFOptionsWithRequiredMargins = {
  includeHeaderFooter: false,
  paperSize: 'Letter',
  margins: {
    top: 1,
    right: 1,
    bottom: 1,
    left: 1,
  },
  orientation: 'portrait',
};

export async function convertMarkdownToPdf(
  markdown: string,
  outputPath: string,
  options: Partial<PDFOptions> = {}
): Promise<string> {
  const md = new MarkdownIt();
  const html = md.render(markdown);

  // Apply PDF options with proper type handling
  const mergedOptions: PDFOptionsWithRequiredMargins = {
    ...DEFAULT_PDF_OPTIONS,
    ...options,
    margins: {
      top: options.margins?.top ?? DEFAULT_PDF_OPTIONS.margins.top,
      right: options.margins?.right ?? DEFAULT_PDF_OPTIONS.margins.right,
      bottom: options.margins?.bottom ?? DEFAULT_PDF_OPTIONS.margins.bottom,
      left: options.margins?.left ?? DEFAULT_PDF_OPTIONS.margins.left,
    },
  };

  // Generate HTML with applied options
  const styledHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @page {
          size: ${mergedOptions.paperSize} ${mergedOptions.orientation};
          margin: ${mergedOptions.margins.top}in ${mergedOptions.margins.right}in ${mergedOptions.margins.bottom}in ${mergedOptions.margins.left}in;
        }
        body {
          font-family: Arial, sans-serif;
        }
      </style>
    </head>
    <body>
      ${mergedOptions.includeHeaderFooter ? '<header></header>' : ''}
      ${html}
      ${mergedOptions.includeHeaderFooter ? '<footer></footer>' : ''}
    </body>
    </html>
  `;

  // Basic PDF conversion (you might want to use a proper PDF library)
  await fs.writeFile(outputPath, styledHtml);

  return outputPath;
}
