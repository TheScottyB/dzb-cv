import type { CVData } from '../cv/index.js';

/**
 * Options for PDF generation
 * @interface PDFGenerationOptions
 */
export interface PDFGenerationOptions {
  /** Paper format (e.g., 'A4', 'Letter') */
  format?: 'A4' | 'Letter';
  /** Page margins */
  margin?: {
    /** Top margin */
    top?: string | number;
    /** Right margin */
    right?: string | number;
    /** Bottom margin */
    bottom?: string | number;
    /** Left margin */
    left?: string | number;
  };
  /** Include header and footer */
  includeHeaderFooter?: boolean;
  /** Header text */
  headerText?: string;
  /** Footer text */
  footerText?: string;
  /** Page orientation */
  orientation?: 'portrait' | 'landscape';
  /** Font family */
  fontFamily?: string;
  /** Template to use */
  template?: 'default' | 'minimal' | 'federal' | 'academic';
  /** Force content to fit on a single page */
  singlePage?: boolean;
  /** Scale content to fit page (used with singlePage) */
  scale?: number;
  /** Additional metadata */
  metadata?: {
    /** Document title */
    title?: string;
    /** Document author */
    author?: string;
    /** Document subject */
    subject?: string;
    /** Document keywords */
    keywords?: string[];
  };
}

/**
 * Interface for PDF generation
 * @interface PDFGenerator
 */
export interface PDFGenerator {
  /**
   * Generate a PDF from CV data
   * @param data The CV data to generate PDF from
   * @param options PDF generation options
   * @returns Promise resolving to PDF buffer
   */

  generate(_data: CVData, _options?: PDFGenerationOptions): Promise<Buffer>;
}
