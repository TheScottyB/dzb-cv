import type { PDFOptions } from "./types/cv-types.js";
export interface CVGenerationOptions {
    format: 'markdown' | 'pdf';
    pdfOptions?: Partial<PDFOptions>;
    filename?: string;
}
/**
 * Generates a CV for the specified sector
 *
 * @param sector The sector to generate the CV for (federal, state, private)
 * @param outputPath The path to save the generated CV
 * @param options Options for CV generation
 * @returns Path to the generated CV file
 */
declare function generateCV(sector: "federal" | "state" | "private", outputPath: string, options?: Partial<CVGenerationOptions>): Promise<string>;
export { generateCV };
