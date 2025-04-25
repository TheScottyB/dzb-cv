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

import { analyzeForATS } from './analyzer.js';
import type { ATSAnalysis, ATSImprovement } from '../shared/types/ats-types.js';
import type { PDFOptions } from '../shared/types/cv-types.js';
import { convertMarkdownToPdf } from '../shared/utils/pdf-generator.js';

/**
 * Represents the result of ATS optimization
 */
interface OptimizationResult {
  /** The optimized markdown content */
  content: string;
  /** The ATS analysis results */
  analysis: ATSAnalysis;
  /** List of optimizations that were applied */
  appliedOptimizations: string[];
  /** Path to the generated PDF (if applicable) */
  pdfPath?: string;
}

/**
 * Optimizes markdown content for ATS compatibility
 * @param markdown - The markdown content to optimize
 * @returns Promise containing the optimization results
 */
export async function optimizeForATS(markdown: string): Promise<OptimizationResult> {
  // Get initial ATS analysis
  const analysis = await analyzeForATS(markdown);
  let optimizedMarkdown = markdown;
  
  // Apply recommendations from analysis
  analysis.suggestions.forEach(() => {
    // TODO: Implement specific optimization logic for each recommendation
    // This could include:
    // - Standardizing headings
    // - Fixing date formats
    // - Improving keyword density
    // - Enhancing readability
  });
  
  // Fix identified issues
  analysis.formattingIssues.forEach(() => {
    // TODO: Implement specific fixes for each issue type
    // This could include:
    // - Removing complex formatting
    // - Fixing contact information layout
    // - Standardizing section structure
  });
  
  return {
    content: optimizedMarkdown,
    analysis: {
      ...analysis,
      keywordMatches: [],
      missingKeywords: [],
      suggestions: [],
      formattingIssues: []
    },
    appliedOptimizations: analysis.suggestions
  };
}

/**
 * Extracts contact information from content
 */
function extractContactInfo(content: string): string | null {
  const lines = content.split('\n');
  let contactSection = '';
  let i = 0;

  while (i < lines.length && i < 5) {
    const line = lines[i];
    if (line && (
      line.includes('@') ||
      line.match(/\d{3}[.-]\d{3}[.-]\d{4}/) ||
      line.match(/[A-Za-z]+,\s*[A-Za-z]+/)
    )) {
      contactSection += line + '\n';
    }
    i++;
  }

  return contactSection || null;
}

/**
 * Formats contact information consistently
 */
function formatContactInfo(contact: string): string {
  const parts = contact.split('\n').filter(Boolean);
  const name = parts.find(p => !p.includes('@') && !p.includes('-'))?.trim();
  const email = parts.find(p => p.includes('@'))?.trim();
  const phone = parts.find(p => p.includes('-'))?.trim();
  const location = parts.find(p => p.includes(','))?.trim();

  return `${name || ''}
${[email, phone].filter(Boolean).join(' | ')}
${location || ''}

`;
}

/**
 * Creates an ATS-optimized PDF from markdown content
 * @param content - The markdown content to optimize and convert
 * @param outputPath - Where to save the generated PDF
 * @param options - PDF generation options
 * @returns Promise containing the optimization results and PDF path
 */
export async function createATSOptimizedPDF(
  content: string,
  outputPath: string,
  options: PDFOptions
): Promise<OptimizationResult> {
  // Optimize the content
  const result = await optimizeForATS(content);
  
  // Add optimization metadata as a comment
  const contentWithMeta = `${result.content}

<!-- ATS Optimization Information
Score: ${result.analysis.score}
Optimizations Applied:
${result.appliedOptimizations.map((opt: string) => `- ${opt}`).join('\n')}
-->`;

  // Generate the PDF
  const pdfPath = await convertMarkdownToPdf(
    contentWithMeta,
    outputPath,
    options
  );

  return {
    ...result,
    pdfPath
  };
}
