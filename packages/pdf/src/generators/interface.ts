import type { CVData, PDFGenerationOptions } from '@dzb-cv/types';

/**
 * Interface for PDF generation implementations
 * @interface PDFGenerator
 */
export interface PDFGenerator {
  /** Generate PDF from CV data */
  generate(data: CVData, options?: PDFGenerationOptions): Promise<Buffer>;
}

/**
 * Extended interface for generators that support HTML/Markdown
 * @interface RichPDFGenerator
 * @extends {PDFGenerator}
 */
export interface RichPDFGenerator extends PDFGenerator {
  /** Generate PDF from Markdown content */
  generateFromMarkdown(markdown: string, options?: PDFGenerationOptions): Promise<Buffer>;
  /** Generate PDF from HTML content */
  generateFromHTML(html: string, options?: PDFGenerationOptions): Promise<Buffer>;
}
