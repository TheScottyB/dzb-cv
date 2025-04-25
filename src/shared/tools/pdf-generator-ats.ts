import { promises as fs } from 'fs';
import { optimizeForATS } from '../../ats/optimizer.js';
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
  outputPath: string
): Promise<ATSGenerationResult> {
  // First optimize the content
  const { content: optimizedContent, analysis, appliedOptimizations } = 
    await optimizeForATS(markdownContent);

  // Generate PDF with optimized content
  const pdfPath = await convertMarkdownToPdfATS(
    optimizedContent,
    outputPath
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
  atsPath: string
): Promise<{
  standard: string;
  ats: ATSGenerationResult;
}> {
  // Generate ATS-optimized version
  const atsResult = await generateATSOptimizedPDF(markdownContent, atsPath);

  // Generate standard version
  const standardPDF = await convertMarkdownToPdfATS(
    markdownContent,
    standardPath
  );

  return {
    standard: standardPDF,
    ats: atsResult
  };
}

/**
 * Converts markdown content to a PDF file optimized for ATS systems
 */
export async function convertMarkdownToPdfATS(
  markdown: string,
  outputPath: string
): Promise<string> {
  // Basic implementation: just write the markdown to a file
  // In a real implementation, you would convert markdown to PDF here
  await fs.writeFile(outputPath, markdown, 'utf-8');
  return outputPath;
}
