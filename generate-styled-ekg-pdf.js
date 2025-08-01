import fs from 'fs';
import { PuppeteerGenerator } from './packages/pdf/dist/generators/puppeteer.js';
import MarkdownIt from 'markdown-it';

async function generateStyledEKGCV() {
  try {
    // Read the markdown CV
    const markdownContent = fs.readFileSync('Dawn_Zurick_Beilfuss_EKG_CV.md', 'utf8');
    
    // Create markdown renderer
    const md = new MarkdownIt();
    const htmlContent = md.render(markdownContent);
    
    // Create enhanced HTML with professional styling
    const styledHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Dawn Zurick Beilfuss - EKG Technician CV</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 40px;
            color: #2c3e50;
            font-size: 11pt;
          }
          
          h1 {
            color: #c0392b;
            font-size: 28pt;
            margin-bottom: 5px;
            font-weight: bold;
            text-align: center;
            border-bottom: 3px solid #c0392b;
            padding-bottom: 10px;
          }
          
          h2 {
            color: #2980b9;
            font-size: 16pt;
            margin-top: 25px;
            margin-bottom: 10px;
            font-weight: bold;
            border-left: 4px solid #2980b9;
            padding-left: 10px;
          }
          
          h3 {
            color: #34495e;
            font-size: 14pt;
            margin-bottom: 8px;
            font-weight: bold;
          }
          
          p {
            margin: 8px 0;
          }
          
          ul {
            margin: 10px 0;
            padding-left: 20px;
          }
          
          li {
            margin: 4px 0;
          }
          
          .contact-section {
            text-align: center;
            margin-bottom: 30px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 8px;
          }
          
          .emoji {
            font-size: 14pt;
          }
          
          hr {
            border: none;
            height: 2px;
            background-color: #bdc3c7;
            margin: 20px 0;
          }
          
          strong {
            color: #2c3e50;
          }
          
          .highlight {
            background-color: #fff3cd;
            padding: 2px 4px;
            border-radius: 3px;
          }
          
          .certification {
            background-color: #d4edda;
            padding: 10px;
            border-left: 4px solid #28a745;
            margin: 10px 0;
            border-radius: 4px;
          }
          
          @media print {
            body { padding: 20px; }
            .page-break { page-break-before: always; }
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
    `;
    
    // Create PDF generator
    const pdfGenerator = new PuppeteerGenerator();
    
    // Enhanced PDF options
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
      preferCSSPageSize: true
    };
    
    // Generate PDF
    console.log('🎨 Generating professionally styled PDF...');
    const pdfBuffer = await pdfGenerator.generateFromHTML(styledHTML, options);
    
    // Save to file
    fs.writeFileSync('Dawn_Zurick_Beilfuss_EKG_CV_Styled.pdf', pdfBuffer);
    
    console.log('✅ Successfully generated Dawn_Zurick_Beilfuss_EKG_CV_Styled.pdf');
    console.log(`📄 File size: ${pdfBuffer.length} bytes`);
    console.log('🎯 Professional styling applied with healthcare color scheme');
    
  } catch (error) {
    console.error('❌ Error generating styled PDF:', error);
    process.exit(1);
  }
}

generateStyledEKGCV();
