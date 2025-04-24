import type { PDFOptions } from '../types/cv-types.js';
export declare const DEFAULT_PDF_OPTIONS: PDFOptions;
interface StyleOptions extends PDFOptions {
    cvType?: 'federal' | 'state' | 'private';
    atsOptimized?: boolean;
    customClasses?: string[];
}
/**
 * Converts markdown content to HTML with enhanced features
 */
export declare function convertMarkdownToHtml(markdownContent: string): string;
/**
 * Applies styling to HTML content with enhanced options
 */
export declare function applyHtmlStyling(htmlContent: string, options: StyleOptions): Promise<string>;
/**
 * Enhanced PDF generation with sector-specific options
 */
export declare function convertMarkdownToPdf(markdownContent: string, outputPath: string, options?: Partial<StyleOptions>): Promise<string>;
export {};
