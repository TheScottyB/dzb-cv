import { convertMarkdownToPdf, DEFAULT_PDF_OPTIONS } from './pdf-generator.js';
import { optimizeForATS } from './ats/optimizer.js';
/**
 * Generates an ATS-optimized PDF from markdown content
 */
export async function generateATSOptimizedPDF(markdownContent, outputPath, options = {}) {
  // First optimize the content
  const {
    content: optimizedContent,
    analysis,
    appliedOptimizations,
  } = await optimizeForATS(markdownContent, {
    ...DEFAULT_PDF_OPTIONS,
    ...options,
  });
  // Generate PDF with optimized content
  const pdfPath = await convertMarkdownToPdf(optimizedContent, outputPath, {
    ...options,
    atsOptimized: true,
  });
  return {
    pdfPath,
    analysis,
    optimizations: appliedOptimizations,
  };
}
/**
 * Generates both standard and ATS-optimized versions
 */
export async function generateBothVersions(markdownContent, standardPath, atsPath, options = {}) {
  // Generate standard version
  const standardPDF = await convertMarkdownToPdf(markdownContent, standardPath, options);
  // Generate ATS-optimized version
  const atsVersion = await generateATSOptimizedPDF(markdownContent, atsPath, options);
  return {
    standard: standardPDF,
    ats: atsVersion,
  };
}
//# sourceMappingURL=pdf-generator-ats.js.map
