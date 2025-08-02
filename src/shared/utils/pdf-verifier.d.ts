/**
 * PDF Verification Utility
 * Checks if generated PDFs contain proper content and structure
 */
export interface PDFVerificationResult {
    isValid: boolean;
    hasContent: boolean;
    pageCount: number;
    textContent?: string;
    contentLength: number;
    issues: string[];
    warnings: string[];
}
/**
 * Verify a PDF file contains proper content
 */
export declare function verifyPDF(filePath: string): Promise<PDFVerificationResult>;
/**
 * Print verification results in a human-readable format
 */
export declare function printVerificationResults(filePath: string, result: PDFVerificationResult): void;
/**
 * Verify multiple PDF files
 */
export declare function verifyMultiplePDFs(filePaths: string[]): Promise<Record<string, PDFVerificationResult>>;
//# sourceMappingURL=pdf-verifier.d.ts.map