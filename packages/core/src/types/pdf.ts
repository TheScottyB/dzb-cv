/**
 * PDF generation options for controlling document output
 */
export interface PDFOptions {
  /** Whether to include header and footer in the PDF */
  includeHeaderFooter: boolean;
  /** Optional header text */
  headerText?: string;
  /** Optional footer text */
  footerText?: string;
  /** Paper size for the PDF */
  paperSize?: 'Letter' | 'A4' | 'Legal';
  /** Page margins in points */
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  /** Title metadata for the PDF document */
  pdfTitle?: string;
  /** Author metadata for the PDF document */
  pdfAuthor?: string;
  /** Page orientation */
  orientation?: 'portrait' | 'landscape';
  /** Font family to use in the PDF */
  fontFamily?: string;
}

