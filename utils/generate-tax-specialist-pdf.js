#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { convertMarkdownToPdf } from '../dist/utils/pdf-generator.js';

/**
 * Generate a PDF from the tailored CV for the Tax Specialist Trainee position
 */
async function main() {
  try {
    // Path to the tailored CV markdown file
    const inputPath = './cv-versions/dawn-tax-specialist-trainee-cv.md';
    
    // Read the markdown content
    console.log(`Reading CV content from ${inputPath}...`);
    const markdownContent = await fs.readFile(inputPath, 'utf-8');
    
    // Create output directory if needed
    const outputDir = './output/state';
    await fs.mkdir(outputDir, { recursive: true });
    
    // Output file path
    const outputPath = path.join(outputDir, 'Dawn_Zurick_Beilfuss_Tax_Specialist_Trainee_CV.pdf');
    
    // Configure PDF options with state-specific styling
    const pdfOptions = {
      paperSize: 'Letter',
      margins: {
        top: 0.75,
        right: 0.75,
        bottom: 0.75,
        left: 0.75
      },
      fontFamily: 'Garamond, serif',
      fontSize: 11,
      includeHeaderFooter: true,
      headerText: 'Dawn Zurick Beilfuss - Revenue Tax Specialist Trainee',
      footerText: `Application for Illinois Department of Revenue - Job ID: 45932 | ${new Date().toLocaleDateString()}`,
      orientation: 'portrait',
      pdfTitle: 'Dawn Zurick Beilfuss - Revenue Tax Specialist Trainee CV',
      pdfAuthor: 'Dawn Zurick Beilfuss',
      pdfCreator: 'DZB CV Generator'
    };
    
    // Custom CSS styling for state applications
    const customCss = `
      h1 { 
        color: #1d4289; 
        font-size: 20pt;
        text-align: center;
        margin-bottom: 4px;
      }
      h2 { 
        color: #2e5cb8; 
        border-bottom: 1px solid #2e5cb8;
        font-size: 14pt;
      }
      h3 { 
        color: #0d2240; 
        margin-bottom: 4px;
        font-size: 12pt;
      }
      strong { color: #0d2240; }
      .state-header {
        background-color: #e8f0fc;
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
    console.log('Generating tailored PDF for Revenue Tax Specialist Trainee position...');
    await convertMarkdownToPdf(markdownContent, outputPath, pdfOptions);
    
    console.log(`Successfully created PDF at: ${outputPath}`);
    
    // Now generate the cover letter
    const coverLetterPath = './output/state/dawn-tax-specialist-trainee-cover-letter.md';
    const coverLetterContent = await fs.readFile(coverLetterPath, 'utf-8');
    const coverLetterOutputPath = path.join(outputDir, 'Dawn_Zurick_Beilfuss_Tax_Specialist_Cover_Letter.pdf');
    
    // Configure PDF options for cover letter
    const coverLetterOptions = {
      ...pdfOptions,
      includeHeaderFooter: false,
      fontFamily: 'Garamond, serif',
      fontSize: 12
    };
    
    // Custom CSS for cover letter
    const coverLetterCss = `
      body {
        line-height: 1.5;
        font-size: 12pt;
      }
      h1 { 
        color: #1d4289; 
        font-size: 18pt;
        text-align: center;
        margin-bottom: 0;
      }
      p {
        margin: 12px 0;
        text-align: justify;
      }
      strong { 
        color: #0d2240; 
      }
    `;
    
    coverLetterOptions.cssStylesheet = coverLetterCss;
    
    // Generate the cover letter PDF
    console.log('Generating cover letter PDF...');
    await convertMarkdownToPdf(coverLetterContent, coverLetterOutputPath, coverLetterOptions);
    
    console.log(`Successfully created cover letter PDF at: ${coverLetterOutputPath}`);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    process.exit(1);
  }
}

main();