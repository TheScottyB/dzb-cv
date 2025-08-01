import fs from 'fs';
import { createRichPDFGenerator } from './packages/pdf/dist/index.js';

async function generateSinglePageEKGCV() {
  try {
    // Read the markdown CV
    const markdownContent = fs.readFileSync('Dawn_Zurick_Beilfuss_EKG_CV.md', 'utf8');
    
    // Create the rich PDF generator
    const pdfGenerator = createRichPDFGenerator();
    
    // PDF generation options with single-page option
    const options = {
      format: 'letter',
      margin: { 
        top: '0.5in', 
        right: '0.5in', 
        bottom: '0.5in', 
        left: '0.5in' 
      },
      printBackground: true,
      includeHeaderFooter: false,
      singlePage: true,
      scale: 0.9
    };
    
    // Generate PDF from markdown
    console.log('🔄 Generating single-page PDF from markdown...');
    const pdfBuffer = await pdfGenerator.generateFromMarkdown(markdownContent, options);
    
    // Save to file
    fs.writeFileSync('Dawn_Zurick_Beilfuss_EKG_CV_SinglePage.pdf', pdfBuffer);
    
    console.log('✅ Successfully generated Dawn_Zurick_Beilfuss_EKG_CV_SinglePage.pdf');
    console.log(`📄 File size: ${pdfBuffer.length} bytes`);
    console.log('🗜️ Content fitted to a single page');
    
  } catch (error) {
    console.error('❌ Error generating single-page PDF:', error);
    process.exit(1);
  }
}

generateSinglePageEKGCV();
