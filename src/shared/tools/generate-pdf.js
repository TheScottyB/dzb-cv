import { promises as fs } from 'fs';
import { convertMarkdownToPdf } from './dist/utils/pdf-generator.js';
import path from 'path';

async function main() {
  try {
    // Read the markdown file
    const markdownContent = await fs.readFile('./cv-versions/dawn-recruitment-specialist-cv.md', 'utf-8');
    
    // Create output directory if it doesn't exist
    const outputDir = './output';
    await fs.mkdir(outputDir, { recursive: true });
    
    // Convert to PDF
    const outputPath = path.join(outputDir, 'dawn-recruitment-specialist-cv.pdf');
    
    const pdfOptions = {
      paperSize: 'Letter',
      margins: {
        top: 0.75,
        right: 0.75,
        bottom: 0.75,
        left: 0.75
      },
      fontFamily: 'Arial, sans-serif',
      fontSize: 11,
      includeHeaderFooter: true,
      headerText: 'Dawn Zurick Beilfuss - Recruitment Central Program Expert',
      footerText: 'Application for Illinois CMS Position',
      orientation: 'portrait',
      pdfTitle: 'Dawn Zurick Beilfuss - Recruitment Specialist CV',
      pdfAuthor: 'Dawn Zurick Beilfuss',
      pdfCreator: 'DZB CV Generator'
    };
    
    await convertMarkdownToPdf(markdownContent, outputPath, pdfOptions);
    console.log(`PDF successfully generated at ${outputPath}`);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
}

main();