#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { convertMarkdownToPdf } from '../dist/utils/pdf-generator.js';

/**
 * Generate a PDF from the tailored CV for the Conservation/Historic Preservation Worker position
 */
async function main() {
  try {
    // Path to the tailored CV markdown file
    const inputPath = './cv-versions/dawn-conservation-worker-illinois-dnr-cv.md';
    
    // Read the markdown content
    console.log(`Reading CV content from ${inputPath}...`);
    const markdownContent = await fs.readFile(inputPath, 'utf-8');
    
    // Create output directory if needed
    const outputDir = './output/state/conservation';
    await fs.mkdir(outputDir, { recursive: true });
    
    // Output file path
    const outputPath = path.join(outputDir, 'Dawn_Zurick_Beilfuss_Conservation_Worker_CV.pdf');
    
    // Configure PDF options with state-specific styling
    const pdfOptions = {
      paperSize: 'Letter',
      margins: {
        top: 0.75,
        right: 0.75,
        bottom: 0.75,
        left: 0.75
      },
      fontFamily: 'Georgia, serif',
      fontSize: 11,
      includeHeaderFooter: true,
      headerText: 'Dawn Zurick Beilfuss - Conservation/Historic Preservation Worker',
      footerText: `Application for Illinois Department of Natural Resources | ${new Date().toLocaleDateString()}`,
      orientation: 'portrait',
      pdfTitle: 'Dawn Zurick Beilfuss - Conservation/Historic Preservation Worker CV',
      pdfAuthor: 'Dawn Zurick Beilfuss',
      pdfCreator: 'DZB CV Generator'
    };
    
    // Custom CSS styling for state applications with nature theme
    const customCss = `
      h1 { 
        color: #2E7D32; 
        font-size: 20pt;
        text-align: center;
        margin-bottom: 4px;
      }
      h2 { 
        color: #388E3C; 
        border-bottom: 1px solid #388E3C;
        font-size: 14pt;
      }
      h3 { 
        color: #1B5E20; 
        margin-bottom: 4px;
        font-size: 12pt;
      }
      strong { color: #1B5E20; }
      .state-header {
        background-color: #E8F5E9;
        padding: 8px;
        border-radius: 5px;
        margin-bottom: 15px;
      }
      ul li {
        margin-bottom: 5px;
      }
    `;
    
    pdfOptions.cssStylesheet = customCss;
    
    // Generate the PDF
    console.log('Generating tailored PDF for Conservation/Historic Preservation Worker position...');
    await convertMarkdownToPdf(markdownContent, outputPath, pdfOptions);
    
    console.log(`Successfully created PDF at: ${outputPath}`);

    // Now generate the cover letter PDF
    const coverLetterInputPath = './output/state/conservation/dawn-conservation-worker-cover-letter.md';
    const coverLetterContent = await fs.readFile(coverLetterInputPath, 'utf-8');
    const coverLetterOutputPath = path.join(outputDir, 'Dawn_Zurick_Beilfuss_Conservation_Worker_Cover_Letter.pdf');
    
    // Configure PDF options for cover letter
    const coverLetterPdfOptions = {
      ...pdfOptions,
      headerText: 'Dawn Zurick Beilfuss - Cover Letter',
      footerText: `Conservation/Historic Preservation Worker Application | ${new Date().toLocaleDateString()}`,
      pdfTitle: 'Dawn Zurick Beilfuss - Cover Letter'
    };
    
    // Generate the cover letter PDF
    console.log('Generating cover letter PDF...');
    await convertMarkdownToPdf(coverLetterContent, coverLetterOutputPath, coverLetterPdfOptions);
    
    console.log(`Successfully created cover letter PDF at: ${coverLetterOutputPath}`);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    process.exit(1);
  }
}

main();