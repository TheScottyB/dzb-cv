#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { convertMarkdownToPdf } from '../dist/utils/pdf-generator.js';

/**
 * Quick script to convert an imported CV to PDF
 */
async function main() {
  try {
    const args = process.argv.slice(2);
    const inputPath = args[0] || './cv-versions/test-imported-cv.md';
    
    // Read the input file
    console.log(`Reading file from ${inputPath}...`);
    const content = await fs.readFile(inputPath, 'utf8');
    
    // Process the content - strip front matter if present
    const processedContent = content.replace(/^---\n(.*?\n)*?---\n\n?/s, '');
    
    // Enhance formatting for PDF
    const enhancedContent = `# Dawn Zurick Beilfuss - CV

${processedContent}`;
    
    // Create output directory if needed
    const outputDir = './output/private';
    await fs.mkdir(outputDir, { recursive: true });
    
    // Generate output filename
    const baseName = path.basename(inputPath, path.extname(inputPath));
    const outputPath = path.join(outputDir, `${baseName}.pdf`);
    
    // Configure PDF options
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
      headerText: 'Dawn Zurick Beilfuss - CV',
      footerText: `Generated on ${new Date().toLocaleDateString()}`,
      orientation: 'portrait',
      pdfTitle: 'Dawn Zurick Beilfuss - CV',
      pdfAuthor: 'Dawn Zurick Beilfuss',
      pdfCreator: 'DZB CV Generator'
    };
    
    // Generate PDF
    console.log('Generating PDF...');
    await convertMarkdownToPdf(enhancedContent, outputPath, pdfOptions);
    
    console.log(`Successfully created PDF: ${outputPath}`);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();