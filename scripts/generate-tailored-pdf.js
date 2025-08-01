#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { convertMarkdownToPdf } from '../dist/utils/pdf-generator.js';

/**
 * Generate a PDF from the tailored CV for the Recruitment Central Program Expert position
 */
async function main() {
  try {
    // Path to the tailored CV markdown file
    const inputPath = './cv-versions/dawn-recruitment-central-program-expert-cv.md';

    // Read the markdown content
    console.log(`Reading CV content from ${inputPath}...`);
    const markdownContent = await fs.readFile(inputPath, 'utf-8');

    // Create output directory if needed
    const outputDir = './generated/cvs/personal/state';
    await fs.mkdir(outputDir, { recursive: true });

    // Output file path
    const outputPath = path.join(outputDir, 'Dawn_Zurick_Beilfuss_Recruitment_Expert_CV.pdf');

    // Configure PDF options with state-specific styling
    const pdfOptions = {
      paperSize: 'Letter',
      margins: {
        top: 0.75,
        right: 0.75,
        bottom: 0.75,
        left: 0.75,
      },
      fontFamily: 'Georgia, serif',
      fontSize: 11,
      includeHeaderFooter: true,
      headerText: 'Dawn Zurick Beilfuss - Recruitment Central Program Expert',
      footerText: `Application for Illinois CMS Position - Job ID: 46252 | ${new Date().toLocaleDateString()}`,
      orientation: 'portrait',
      pdfTitle: 'Dawn Zurick Beilfuss - Recruitment Central Program Expert CV',
      pdfAuthor: 'Dawn Zurick Beilfuss',
      pdfCreator: 'DZB CV Generator',
    };

    // Custom CSS styling for state applications
    const customCss = `
      h1 { 
        color: #1a466b; 
        font-size: 20pt;
        text-align: center;
        margin-bottom: 4px;
      }
      h2 { 
        color: #2874a6; 
        border-bottom: 1px solid #2874a6;
        font-size: 14pt;
      }
      h3 { 
        color: #154360; 
        margin-bottom: 4px;
        font-size: 12pt;
      }
      strong { color: #154360; }
      .state-header {
        background-color: #e8f4fc;
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
    console.log('Generating tailored PDF for Recruitment Central Program Expert position...');
    await convertMarkdownToPdf(markdownContent, outputPath, pdfOptions);

    console.log(`Successfully created PDF at: ${outputPath}`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    process.exit(1);
  }
}

main();
