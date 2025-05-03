export * from './interface.js';
export * from './pdf-lib.js';
export * from './puppeteer.js';

import { PdfLibGenerator } from './pdf-lib.js';
import { PuppeteerGenerator } from './puppeteer.js';
import type { PDFGenerator, RichPDFGenerator } from './interface.js';

/**
 * Create a basic PDF generator using pdf-lib
 */
export function createPDFGenerator(): PDFGenerator {
  return new PdfLibGenerator();
}

/**
 * Create a rich PDF generator with HTML/Markdown support using Puppeteer
 */
export function createRichPDFGenerator(): RichPDFGenerator {
  return new PuppeteerGenerator();
}
