/**
 * Example Usage:
 *
 * import { createATSOptimizedPDF } from './src/utils/ats/optimizer';
 * import { DEFAULT_PDF_OPTIONS } from './src/utils/pdf-generator';
 *
 * const markdownContent = "# ATS Test CV\nDawn Zurick Beilfuss\nemail@example.com | 123-456-7890\nChicago, IL\n## Professional Experience\nCompany | 2023 - Present\nRole\n- Did things.\n";
 * const outputPath = 'output/ats-test.pdf';
 * createATSOptimizedPDF(markdownContent, outputPath, DEFAULT_PDF_OPTIONS)
 *   .then(result => {
 *     console.log('ATS PDF Path:', result.pdfPath);
 *     console.log('ATS Analysis Score:', result.analysis.score);
 *     console.log('Optimizations:', result.optimizations);
 *   });
 */
import type { ATSAnalysis } from '../../types/ats-types.js';
import type { PDFOptions } from '../../types/cv-types.js';
interface OptimizationResult {
    content: string;
    analysis: ATSAnalysis;
    appliedOptimizations: string[];
    pdfPath?: string;
}
/**
 * Optimizes content for ATS compatibility
 */
export declare function optimizeForATS(content: string, options: PDFOptions): Promise<OptimizationResult>;
/**
 * Integration with PDF generation
 */
export declare function createATSOptimizedPDF(content: string, outputPath: string, options: PDFOptions): Promise<{
    pdfPath: string;
    content: string;
    analysis: ATSAnalysis;
    optimizations: string[];
}>;
export {};
