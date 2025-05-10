import { promises as fs } from 'fs';
import { join } from 'path';
import Handlebars from 'handlebars';
import {
  loadTemplate,
  registerHelpers,
  sortByDate,
  formatUSDate,
  formatFederalDateRange,
  calculateGradeLevel,
  calculateTotalYears,
  formatSalary,
  defaultValue,
  formatWithPrefix,
} from '../.tmp/artefacts/dist/utils/helpers.js';
import { resolveDataPath } from '../.tmp/artefacts/dist/utils/path-resolver.js';
import {
  convertMarkdownToPdf,
  DEFAULT_PDF_OPTIONS,
} from '../.tmp/artefacts/dist/utils/pdf-generator.js';
/**
 * Default options for CV generation
 */
const DEFAULT_CV_OPTIONS = {
  format: 'markdown',
  pdfOptions: DEFAULT_PDF_OPTIONS,
  filename: 'cv',
};
/**
 * Generates a CV for the specified sector
 *
 * @param sector The sector to generate the CV for (federal, state, private)
 * @param outputPath The path to save the generated CV
 * @param options Options for CV generation
 * @returns Path to the generated CV file
 */
async function generateCV(sector, cvData, outputPath, options) {
  try {
    // Merge defaults with provided options
    const mergedOptions = { ...DEFAULT_CV_OPTIONS, ...options };
    // Register Handlebars helpers directly
    console.log('Registering Handlebars helpers directly...');
    try {
      // Call the standard registerHelpers function first
      registerHelpers();
      // Then explicitly register each helper to ensure they're available
      Handlebars.registerHelper('sortByDate', sortByDate);
      Handlebars.registerHelper('formatDateRange', formatFederalDateRange);
      Handlebars.registerHelper('formatFederalDateRange', formatFederalDateRange);
      Handlebars.registerHelper('formatUSDate', formatUSDate);
      Handlebars.registerHelper('calculateGradeLevel', calculateGradeLevel);
      Handlebars.registerHelper('calculateTotalYears', calculateTotalYears);
      Handlebars.registerHelper('formatSalary', formatSalary);
      Handlebars.registerHelper('defaultValue', defaultValue);
      Handlebars.registerHelper('formatWithPrefix', formatWithPrefix);
      // Add a test helper to verify registration
      Handlebars.registerHelper('testHelper', function () {
        return 'Helper registration is working!';
      });
      // Verify helpers are available
      if (typeof Handlebars.helpers['sortByDate'] !== 'function') {
        console.error('Helper registration failed! sortByDate is not available.');
        throw new Error('Helper registration verification failed');
      }
      console.log('Successfully registered all Handlebars helpers directly');
    } catch (error) {
      console.error('Error registering Handlebars helpers:', error);
      throw new Error(
        `Failed to register Handlebars helpers: ${error instanceof Error ? error.message : String(error)}`
      );
    }
    // Get the template path
    const templatePath = resolveDataPath(`templates/${sector}/${sector}-template.md`);
    // Load the template
    const template = await loadTemplate(templatePath);
    // Generate CV content from template
    const markdownContent = template(cvData);
    // Create output directory if it doesn't exist
    await fs.mkdir(outputPath, { recursive: true });
    // Generate the appropriate filename
    const filename =
      mergedOptions.filename ||
      `${cvData.personalInfo.name.full.toLowerCase().replace(/\s+/g, '-')}-${sector}-cv`;
    // Save based on format
    if (mergedOptions.format === 'pdf') {
      // Configure PDF specific options
      const pdfOptions = mergedOptions.pdfOptions || {};
      // Add sector-specific styling
      pdfOptions.pdfTitle = `${cvData.personalInfo.name.full} - ${sector.charAt(0).toUpperCase() + sector.slice(1)} CV`;
      pdfOptions.pdfAuthor = cvData.personalInfo.name.full;
      // Set header/footer if enabled
      if (pdfOptions.includeHeaderFooter) {
        pdfOptions.headerText =
          pdfOptions.headerText || `${cvData.personalInfo.name.full} - ${sector.toUpperCase()} CV`;
        pdfOptions.footerText =
          pdfOptions.footerText || `Generated on ${new Date().toLocaleDateString()}`;
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
//# sourceMappingURL=generator.js.map
