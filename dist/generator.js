import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { promises as fs } from 'fs';
import { loadTemplate, loadCVData } from "./utils/helpers.js";
import { convertMarkdownToPdf, DEFAULT_PDF_OPTIONS } from './utils/pdf-generator.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
/**
 * Default options for CV generation
 */
const DEFAULT_CV_OPTIONS = {
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
async function generateCV(sector, outputPath, options = {}) {
    // Merge options with defaults
    const mergedOptions = {
        ...DEFAULT_CV_OPTIONS,
        ...options,
        pdfOptions: {
            ...DEFAULT_CV_OPTIONS.pdfOptions,
            ...(options.pdfOptions || {})
        }
    };
    try {
        // Load base CV data
        const cvData = await loadCVData(join(__dirname, "data", "base-info.json"));
        // Load sector-specific template
        const templatePath = join(__dirname, "templates", sector, `${sector}-template.md`);
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
        }
        else {
            // Save markdown file
            const markdownPath = join(outputPath, `${filename}.md`);
            await fs.writeFile(markdownPath, markdownContent, 'utf-8');
            console.log(`Generated ${sector} CV as Markdown: ${markdownPath}`);
            return markdownPath;
        }
    }
    catch (error) {
        console.error(`Error generating ${sector} CV:`, error);
        throw error;
    }
}
export { generateCV };
//# sourceMappingURL=generator.js.map