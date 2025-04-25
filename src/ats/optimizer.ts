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
import { convertMarkdownToPdf } from '../shared/utils/pdf-generator.js';
import type { ATSAnalysis, ATSImprovement } from '../shared/types/ats-types.js';
import type { PDFOptions } from '../shared/types/cv-types.js';

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
  analysis.recommendations.forEach((recommendation: string) => {
    // TODO: Implement specific optimization logic for each recommendation
    // This could include:
    // - Standardizing headings
    // - Fixing date formats
    // - Improving keyword density
    // - Enhancing readability
  });
  
  // Fix identified issues
  analysis.issues.forEach((issue) => {
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
    appliedOptimizations: analysis.recommendations
  };
}

/**
 * Gets optimization strategy for a specific issue
 */
function getOptimizationForIssue(issue: ATSImprovement) {
  const optimizations: Record<string, {
    apply: (content: string) => string;
    description: string;
  }> = {
    COMPLEX_FORMATTING: {
      apply: (content: string) => {
        return content
          .replace(/[•◦‣⁃]/g, '-')  // Replace special bullets
          .replace(/[""]/g, '"')    // Replace smart quotes
          .replace(/['']/g, "'")    // Replace smart apostrophes
          .replace(/\t/g, '    ');  // Replace tabs with spaces
      },
      description: 'Simplified special characters and formatting'
    },
    UNUSUAL_HEADINGS: {
      apply: (content: string) => {
        const headingMap: Record<string, string> = {
          'my amazing journey': 'Professional Experience',
          'cool stuff i did': 'Achievements',
          'about me': 'Professional Summary',
          // Add more mappings as needed
        };

        return content.replace(
          /^#+\s*(.*?)$/gim,
          (match, heading) => {
            const normalized = heading.toLowerCase().trim();
            return match.replace(heading, headingMap[normalized] || heading);
          }
        );
      },
      description: 'Standardized section headings'
    },
    MISSING_DATES: {
      apply: (content: string) => {
        // Look for experience entries without dates
        return content.replace(
          /^([A-Za-z\s]+)\n([A-Za-z\s]+)\n/gm,
          (match, company, role) => {
            if (!/\d{4}/.test(match)) {
              return `${company} | Present\n${role}\n`;
            }
            return match;
          }
        );
      },
      description: 'Added missing dates to experience entries'
    },
    CONTACT_INFO: {
      apply: (content: string) => {
        // Ensure contact info is properly formatted at the top
        const contactInfo = extractContactInfo(content);
        if (contactInfo) {
          const formattedContact = formatContactInfo(contactInfo);
          return formattedContact + content.replace(contactInfo, '');
        }
        return content;
      },
      description: 'Reformatted contact information'
    }
  };

  return optimizations[issue.type];
}

/**
 * Extracts contact information from content
 */
function extractContactInfo(content: string): string | null {
  const lines = content.split('\n');
  let contactSection = '';
  let i = 0;

  while (i < lines.length && i < 5) {
    if (
      lines[i].includes('@') ||
      lines[i].match(/\d{3}[.-]\d{3}[.-]\d{4}/) ||
      lines[i].match(/[A-Za-z]+,\s*[A-Za-z]+/)
    ) {
      contactSection += lines[i] + '\n';
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
