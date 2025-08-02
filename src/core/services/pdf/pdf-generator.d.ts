import type { CVData } from '../../types/cv-base.js';
import type { PaperFormat } from 'puppeteer';
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
    paperSize?: PaperFormat;
    /** Margins for the PDF in inches */
    margins?: {
        top: string;
        right: string;
        bottom: string;
        left: string;
    };
    /** Title of the PDF document */
    pdfTitle?: string;
    /** Author of the PDF document */
    pdfAuthor?: string;
    /** Page orientation */
    orientation?: 'portrait' | 'landscape';
    /** Font family to use in the PDF */
    fontFamily?: string;
    /** Template to use */
    template?: 'default' | 'minimal' | 'federal' | 'academic';
    /** Force content to fit on a single page */
    singlePage?: boolean;
    /** Scale factor for single-page layout (0.1 to 1.0) */
    scale?: number;
    /** Minimum font size to maintain readability (in pt) */
    minFontSize?: number;
    /** Line height adjustment for single-page layout */
    lineHeight?: number;
    /** Use LLM-optimized content for generation */
    llmOptimized?: boolean;
    /** Pre-optimized content from LLM processing */
    optimizedContent?: string;
}
/**
 * Abstract base class for PDF generation
 */
export declare abstract class PDFGenerator {
    abstract generate(data: CVData, options?: Partial<PDFGenerationOptions>): Promise<Buffer>;
    abstract generateFromMarkdown(markdown: string, outputPath: string, options?: Partial<PDFGenerationOptions>): Promise<string>;
    abstract generateFromHTML(html: string, outputPath: string, options?: Partial<PDFGenerationOptions>): Promise<string>;
    abstract generateFromTemplate(templatePath: string, data: CVData, outputPath: string, options?: Partial<PDFGenerationOptions>): Promise<string>;
    protected abstract generateHTML(data: CVData, options?: Partial<PDFGenerationOptions>): string;
}
/**
 * Default implementation of PDF Generator
 */
export declare class DefaultPDFGenerator extends PDFGenerator {
    generate(data: CVData, options?: Partial<PDFGenerationOptions>): Promise<Buffer>;
    generateFromMarkdown(markdown: string, outputPath: string, options?: Partial<PDFGenerationOptions>): Promise<string>;
    generateFromHTML(html: string, outputPath: string, options?: Partial<PDFGenerationOptions>): Promise<string>;
    generateFromTemplate(templatePath: string, data: CVData, outputPath: string, options?: Partial<PDFGenerationOptions>): Promise<string>;
    protected generateHTML(data: CVData, options?: Partial<PDFGenerationOptions>): string;
    /**
     * Generate additional CSS styles for single-page layout
     */
    private getSinglePageStyles;
    /**
     * Apply runtime optimizations for single-page layout
     */
    private optimizeForSinglePage;
    /**
     * Parse margin values to pixels (approximate)
     */
    private parseMargins;
    /**
     * Generate HTML using LLM-optimized content
     */
    private generateOptimizedHTML;
    /**
     * Format LLM-optimized content for HTML display
     */
    private formatOptimizedContent;
}
//# sourceMappingURL=pdf-generator.d.ts.map