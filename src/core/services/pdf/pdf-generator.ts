import type { CVData } from '../../types/cv-base.js';

/**
 * PDF generation options
 */
export interface PDFGenerationOptions {
  /** Whether to include header and footer in the PDF */
  includeHeaderFooter?: boolean;
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
 * Interface for PDF generation
 */
export interface PDFGenerator {
  /**
   * Generate a PDF from CV data
   * @param data The CV data to generate the PDF from
   * @param options Optional PDF generation options
   * @returns A Promise that resolves to a Buffer containing the PDF
   */
  generate(data: CVData, options?: Partial<PDFGenerationOptions>): Promise<Buffer>;

  /**
   * Generate a PDF from markdown content
   * @param markdown The markdown content to convert to PDF
   * @param outputPath The path where the PDF should be saved
   * @param options Optional PDF generation options
   * @returns A Promise that resolves to the path of the generated PDF
   */
  generateFromMarkdown(markdown: string, outputPath: string, options?: Partial<PDFGenerationOptions>): Promise<string>;

  /**
   * Generate a PDF from HTML content
   * @param html The HTML content to convert to PDF
   * @param outputPath The path where the PDF should be saved
   * @param options Optional PDF generation options
   * @returns A Promise that resolves to the path of the generated PDF
   */
  generateFromHTML(html: string, outputPath: string, options?: Partial<PDFGenerationOptions>): Promise<string>;

  /**
   * Generate a PDF from a template
   * @param templatePath The path to the template file
   * @param data The data to use in the template
   * @param outputPath The path where the PDF should be saved
   * @param options Optional PDF generation options
   * @returns A Promise that resolves to the path of the generated PDF
   */
  generateFromTemplate(templatePath: string, data: CVData, outputPath: string, options?: Partial<PDFGenerationOptions>): Promise<string>;
} 