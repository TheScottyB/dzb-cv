#!/usr/bin/env node

import { promises as fs } from 'fs';
import _path from 'path';
import { convertMarkdownToPdf } from '../dist/utils/pdf-generator.js';

/**
 * Generate a PDF of the cover letter for the Recruitment Central Program Expert position
 */
async function main() {
  try {
    // Path to the cover letter markdown file
    const inputPath = './generated/cvs/personal/state/dawn-recruitment-expert-cover-letter.md';

    // Read the markdown content
    console.log(`Reading cover letter content from ${inputPath}...`);
    const markdownContent = await fs.readFile(inputPath, 'utf-8');

    // Output file path
    const outputPath = './generated/cvs/personal/state/Dawn_Zurick_Beilfuss_Cover_Letter.pdf';

    // Configure PDF options
    const pdfOptions = {
      paperSize: 'Letter',
      margins: {
        top: 1,
        right: 1,
        bottom: 1,
        left: 1,
      },
      fontFamily: 'Georgia, serif',
      fontSize: 12,
      includeHeaderFooter: false,
      orientation: 'portrait',
      pdfTitle: 'Dawn Zurick Beilfuss - Cover Letter',
      pdfAuthor: 'Dawn Zurick Beilfuss',
      pdfCreator: 'DZB CV Generator',
    };

    // Custom CSS styling for cover letter
    const customCss = `
      body {
        line-height: 1.5;
        font-size: 12pt;
      }
      h1 { 
        color: #1a466b; 
        font-size: 18pt;
        text-align: center;
        margin-bottom: 0;
      }
      p {
        margin: 12px 0;
        text-align: justify;
      }
      strong { 
        color: #154360; 
      }
    `;

    pdfOptions.cssStylesheet = customCss;

    // Generate the PDF
    console.log('Generating PDF cover letter...');
    await convertMarkdownToPdf(markdownContent, outputPath, pdfOptions);

    console.log(`Successfully created cover letter PDF at: ${outputPath}`);
  } catch (error) {
    console.error('Error generating cover letter PDF:', error);
    process.exit(1);
  }
}

main();
