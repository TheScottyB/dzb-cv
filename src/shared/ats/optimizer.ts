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
import { convertMarkdownToPdf } from '../pdf-generator.js';
import type { ATSAnalysis, ATSImprovement } from '../types/ats-types.js';
import type { PDFOptions } from '../types/cv-types.js';

interface OptimizationResult {
  content: string;           // Make sure this is preserved
  analysis: ATSAnalysis;
  appliedOptimizations: string[];
  pdfPath?: string;          // Optional for PDF generation
}

/**
 * Optimizes content for ATS compatibility
 */
export async function optimizeForATS(markdown: string): Promise<ATSAnalysis> {
  const analysis = await analyzeForATS(markdown);
  
  // Basic optimization
  let optimizedMarkdown = markdown;
  
  // Apply suggestions
  analysis.suggestions.forEach(suggestion => {
    // Apply suggestion to optimizedMarkdown
  });
  
  // Fix formatting issues
  analysis.formattingIssues.forEach(issue => {
    // Fix formatting issue in optimizedMarkdown
  });
  
  return analysis;
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
 * Integration with PDF generation
 */
export async function createATSOptimizedPDF(
  content: string,
  outputPath: string,
  options: PDFOptions
): Promise<{
  pdfPath: string;
  content: string;          // Add this to preserve content
  analysis: ATSAnalysis;
  optimizations: string[];
}> {
  // Optimize content
  const { content: optimizedContent, analysis, appliedOptimizations } = 
    await optimizeForATS(content);

  // Add ATS optimization meta information
  const contentWithMeta = `${optimizedContent}

<!-- ATS Optimization Information
Score: ${analysis.score}
Optimizations Applied:
${appliedOptimizations.map(opt => `- ${opt}`).join('\n')}
-->`;

  // Generate PDF with optimized content using the generator
  const pdfPath = await convertMarkdownToPdf(
    contentWithMeta,
    outputPath,
    {
      ...options,
      atsOptimized: true
    }
  );

  return {
    pdfPath,
    content: optimizedContent,  // Return the optimized content
    analysis,
    optimizations: appliedOptimizations
  };
}
