/**
 * CV Generation options
 */

import type { PDFOptions } from './pdf.js';
import type { TemplateOptions } from './template.js';

/**
 * Options for controlling CV generation output
 */
export interface CVGenerationOptions {
  /** Output format for the CV */
  format: 'markdown' | 'pdf' | 'docx' | 'html';
  /** Template options for generation */
  templateOptions: Partial<TemplateOptions>;
  /** PDF-specific options when generating PDF output */
  pdfOptions?: Partial<PDFOptions>;
  /** Output filename */
  filename?: string;
}

/** @deprecated Use PDFOptions from './pdf.js' instead */
export { PDFOptions as PDFGenerationOptions };
