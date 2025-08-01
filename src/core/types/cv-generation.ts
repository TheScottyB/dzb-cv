/**
 * CV Generation and PDF options
 */

import { TemplateOptions } from './cv-types.js';

export interface PDFOptions {
  includeHeaderFooter: boolean;
  headerText?: string;
  footerText?: string;
  paperSize?: 'Letter' | 'A4' | 'Legal';
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  pdfTitle?: string;
  pdfAuthor?: string;
  orientation?: 'portrait' | 'landscape';
  fontFamily?: string;
  /** Force content to fit on a single page */
  singlePage?: boolean;
  /** Scale factor for single-page layout (0.1 to 1.0) */
  scale?: number;
  /** Line height adjustment for single-page layout */
  lineHeight?: number;
  /** Minimum font size to maintain readability (in pt) */
  minFontSize?: number;
}

export interface CVGenerationOptions {
  format: 'markdown' | 'pdf';
  pdfOptions?: Partial<PDFOptions>;
  filename?: string;
  templateOptions?: TemplateOptions;
}
