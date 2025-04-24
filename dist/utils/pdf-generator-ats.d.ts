import type { PDFOptions } from '../types/cv-types.js';
import type { ATSAnalysis } from '../types/ats-types.js';
export interface ATSGenerationResult {
    pdfPath: string;
    analysis: ATSAnalysis;
    optimizations: string[];
}
/**
 * Generates an ATS-optimized PDF from markdown content
 */
export declare function generateATSOptimizedPDF(markdownContent: string, outputPath: string, options?: Partial<PDFOptions>): Promise<ATSGenerationResult>;
/**
 * Generates both standard and ATS-optimized versions
 */
export declare function generateBothVersions(markdownContent: string, standardPath: string, atsPath: string, options?: Partial<PDFOptions>): Promise<{
    standard: string;
    ats: ATSGenerationResult;
}>;
