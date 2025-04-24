import { promises as fs } from 'fs';
import { join } from 'path';
import { 
  loadTemplate, 
  loadCVData, 
  initializeTemplateSystem 
} from "./utils/helpers.js";
import { 
  resolveOutputPath, 
  resolveDataPath, 
  ensureProjectDirectories 
} from "./utils/path-resolver.js";
import { convertMarkdownToPdf, DEFAULT_PDF_OPTIONS } from './utils/pdf-generator.js';
import type { CVData, PDFOptions } from "./types/cv-types.js";

export interface CVGenerationOptions {
  format: 'markdown' | 'pdf';
  pdfOptions?: Partial<PDFOptions>;
  filename?: string;
}

/**
 * Default options for CV generation
 */
const DEFAULT_CV_OPTIONS: CVGenerationOptions = {
  format: 'markdown',
  pdfOptions: DEFAULT_PDF_OPTIONS,
  filename: 'cv'
};

/**
 * Generates a CV for the specified sector
 * 
 * @param sector The sector to generate the CV for (federal, state, private)
 * @param outputPath The path to save the generated CV
 * @param options Options for CV generation
 * @returns Path to the generated CV file
 */
    const template = await loadTemplate(templatePath);
    
    // Generate CV content from template
    const markdownContent = template(cvData);
    
    // Create output directory if it doesn't exist
    await fs.mkdir(outputPath, { recursive: true });
    
    // Generate the appropriate filename
    const filename = mergedOptions.filename || `${cvData.personalInfo.name.full.toLowerCase().replace(/\s+/g, '-')}-${sector}-cv`;
    
    // Save based on format
    if (mergedOptions.format === 'pdf') {
      // Configure PDF specific options
      const pdfOptions = mergedOptions.pdfOptions || {};
      
      // Add sector-specific styling
      pdfOptions.pdfTitle = `${cvData.personalInfo.name.full} - ${sector.charAt(0).toUpperCase() + sector.slice(1)} CV`;
      pdfOptions.pdfAuthor = cvData.personalInfo.name.full;
      
      // Set header/footer if enabled
      if (pdfOptions.includeHeaderFooter) {
        pdfOptions.headerText = pdfOptions.headerText || `${cvData.personalInfo.name.full} - ${sector.toUpperCase()} CV`;
        pdfOptions.footerText = pdfOptions.footerText || `Generated on ${new Date().toLocaleDateString()}`;
      }
      
      // Generate PDF file
      const pdfPath = join(outputPath, `${filename}.pdf`);
      await convertMarkdownToPdf(markdownContent, pdfPath, pdfOptions);
      
      console.log(`Generated ${sector} CV as PDF: ${pdfPath}`);
      return pdfPath;
    } else {
      // Save markdown file
      const markdownPath = join(outputPath, `${filename}.md`);
      await fs.writeFile(markdownPath, markdownContent, 'utf-8');
      
      console.log(`Generated ${sector} CV as Markdown: ${markdownPath}`);
      return markdownPath;
    }
  } catch (error) {
    console.error(`Error generating ${sector} CV:`, error);
    throw error;
  }
}

export { generateCV };
