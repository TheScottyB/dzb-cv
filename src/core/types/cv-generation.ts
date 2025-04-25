/**
 * CV Generation and PDF options
 */

import { Experience } from './cv-base.js';
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
}

export interface CVGenerationOptions {
  format: 'markdown' | 'pdf';
  pdfOptions?: Partial<PDFOptions>;
  filename?: string;
  templateOptions?: TemplateOptions;
}

