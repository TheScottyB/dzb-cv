import { promises as fs } from 'fs';
import MarkdownIt from 'markdown-it';
import type { PDFOptions } from '../types/cv-types.js';

export const DEFAULT_PDF_OPTIONS: PDFOptions = {
  includeHeaderFooter: false,
  paperSize: 'Letter',
  margins: {
    top: 1,
    right: 1,
    bottom: 1,
    left: 1
  },
  orientation: 'portrait'
};

export async function convertMarkdownToPdf(
  markdown: string,
  outputPath: string,
  options: Partial<PDFOptions> = {}
): Promise<string> {
  const md = new MarkdownIt();
  const html = md.render(markdown);
  
  // Basic PDF conversion (you might want to use a proper PDF library)
  await fs.writeFile(outputPath, html);
  
  return outputPath;
} 