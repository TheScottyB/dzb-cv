import { promises as fs } from 'fs';
import { optimizeForATS } from '../ats/optimizer.js';
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
export async function generateATSOptimizedPDF(
  markdownContent: string,
  outputPath: string,
  options: Partial<PDFOptions> = {}
): Promise<ATSGenerationResult> {
  // First optimize the content
  const { content: optimizedContent, analysis, appliedOptimizations } = 
    await optimizeForATS(markdownContent, {
      ...DEFAULT_PDF_OPTIONS,
      ...options
    });

  // Generate PDF with optimized content
  const pdfPath = await convertMarkdownToPdf(
    optimizedContent,
    outputPath,
    {
      ...options,
      atsOptimized: true
    }
  );

  return {
    pdfPath,
    analysis,
    optimizations: appliedOptimizations
  };
}

/**
 * Generates both standard and ATS-optimized versions
 */
export async function generateBothVersions(
  markdownContent: string,
  standardPath: string,
  atsPath: string,
  options: Partial<PDFOptions> = {}
): Promise<{
  standard: string;
  ats: ATSGenerationResult;
}> {
  // Generate standard version
  const standardPDF = await convertMarkdownToPdf(
    markdownContent,
    standardPath,
    options
  );

  // Generate ATS-optimized version
  const atsVersion = await generateATSOptimizedPDF(
    markdownContent,
    atsPath,
    options
  );

  return {
    standard: standardPDF,
    ats: atsVersion
  };
}

export async function convertMarkdownToPdfATS(
  markdown: string,
  outputPath: string,
  options: Partial<PDFOptions> = {}
): Promise<string> {
  // Analyze and optimize for ATS
  const analysis = await optimizeForATS(markdown);
  
  // Basic PDF conversion (you might want to use a proper PDF library)
  await fs.writeFile(outputPath, markdown);
  
  return outputPath;
}
