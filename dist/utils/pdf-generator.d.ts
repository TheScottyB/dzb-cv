import type { PDFOptions } from '../types/cv-types.js';
/**
 * Default PDF options for CV generation
 */
export declare const DEFAULT_PDF_OPTIONS: PDFOptions;
/**
 * Converts markdown content to HTML
 * @param markdownContent The markdown content to convert
 * @returns HTML content
 */
export declare function convertMarkdownToHtml(markdownContent: string): string;
/**
 * Applies styling to HTML content
 * @param htmlContent The HTML content to style
 * @param options PDF styling options
 * @returns Styled HTML content
 */
export declare function applyHtmlStyling(htmlContent: string, options: PDFOptions): Promise<string>;
/**
 * Converts markdown content to PDF
 * @param markdownContent The markdown content to convert
 * @param outputPath The path to save the PDF to
 * @param options PDF options
 * @returns Path to the generated PDF
 */
export declare function convertMarkdownToPdf(markdownContent: string, outputPath: string, options?: Partial<PDFOptions>): Promise<string>;
/**
 * Creates a directory for PDF files if it doesn't exist
 * @param dirPath Directory path
 */
export declare function createPdfDirectory(dirPath: string): Promise<void>;
