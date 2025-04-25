/**
 * CV Generation and PDF options
 */

/**
 * PDF generation options
 */
export interface PDFOptions {
  /** Whether to include header and footer in the PDF */
  includeHeaderFooter: boolean;
  /** Text to display in the header */
  headerText?: string;
  /** Text to display in the footer */
  footerText?: string;
  /** Paper size for the PDF */
  paperSize?: 'Letter' | 'A4' | 'Legal';
  /** Margins for the PDF in inches */
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  /** Title of the PDF document */
  pdfTitle?: string;
  /** Author of the PDF document */
  pdfAuthor?: string;
  /** Page orientation */
  orientation?: 'portrait' | 'landscape';
  /** Font family to use in the PDF */
  fontFamily?: string;
}

/**
 * CV generation options
 */
export interface CVGenerationOptions {
  format: 'markdown' | 'pdf';
  pdfOptions?: Partial<PDFOptions>;
  filename?: string;
} 