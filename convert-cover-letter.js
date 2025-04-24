import { convertMarkdownToPdf } from './dist/utils/pdf-generator.js';
import { promises as fs } from 'fs';

async function convertCoverLetter() {
  try {
    const markdownPath = 'output/nm-crystal-lake/dawn-nm-patient-service-rep-cover.md';
    const pdfPath = 'output/nm-crystal-lake/dawn-nm-patient-service-rep-cover-new.pdf';
    
    const markdownContent = await fs.readFile(markdownPath, 'utf-8');
    
    await convertMarkdownToPdf(markdownContent, pdfPath, {
      paperSize: 'Letter',
      margins: {
        top: 1,
        right: 1,
        bottom: 1,
        left: 1
      },
      fontSize: 11,
      includeHeaderFooter: false,
      pdfTitle: 'Dawn Zurick Beilfuss - Cover Letter for Northwestern Medicine'
    });
    
    console.log('Cover letter PDF generated successfully!');
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
}

convertCoverLetter();
