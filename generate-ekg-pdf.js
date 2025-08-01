import fs from 'fs';
import { createRichPDFGenerator } from './packages/pdf/dist/index.js';

async function generateEKGCV() {
  try {
    // Read the markdown CV we generated
    const markdownContent = fs.readFileSync('Dawn_Zurick_Beilfuss_EKG_CV.md', 'utf8');
    
    // Create the rich PDF generator
    const pdfGenerator = createRichPDFGenerator();
    
    // PDF generation options with styling
    const options = {
      format: 'letter',
      margin: { 
        top: '0.75in', 
        right: '0.75in', 
        bottom: '0.75in', 
        left: '0.75in' 
      },
      printBackground: true,
      includeHeaderFooter: false
    };
    
    // Generate PDF from markdown
    console.log('🔄 Generating PDF from markdown...');
    const pdfBuffer = await pdfGenerator.generateFromMarkdown(markdownContent, options);
    
    // Save to file
    fs.writeFileSync('Dawn_Zurick_Beilfuss_EKG_CV.pdf', pdfBuffer);
    
    console.log('✅ Successfully generated Dawn_Zurick_Beilfuss_EKG_CV.pdf');
    console.log(`📄 File size: ${pdfBuffer.length} bytes`);
    
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    process.exit(1);
  }
}

generateEKGCV();
