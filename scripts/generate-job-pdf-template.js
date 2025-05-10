#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { convertMarkdownToPdf } from '../dist/utils/pdf-generator.js';

/**
 * TEMPLATE FOR PDF GENERATION
 * Copy this file when creating a new job application and modify the variables below
 */

// MODIFY THESE VARIABLES FOR YOUR JOB APPLICATION
const JOB_TITLE = 'Position Title'; // e.g., "Conservation Worker"
const JOB_DEPARTMENT = 'Department Name'; // e.g., "Illinois Department of Natural Resources"
const JOB_ID = 'Job ID'; // e.g., "12345" or leave as empty string if not available
const CV_FILENAME = 'dawn-position-employer-cv.md'; // The markdown file in cv-versions/
const OUTPUT_SUBDIR = 'position'; // Subdirectory within output/state/ or output/federal/
const SECTOR = 'state'; // "state", "federal", or "private"
const PRIMARY_COLOR = '#2E7D32'; // Main heading color
const SECONDARY_COLOR = '#388E3C'; // Secondary heading color
const ACCENT_COLOR = '#1B5E20'; // Text accent color
const BG_COLOR = '#E8F5E9'; // Background color for header areas

// TYPICALLY DON'T NEED TO MODIFY BELOW THIS LINE

/**
 * Generate a PDF from the tailored CV
 */
async function main() {
  try {
    // Path to the tailored CV markdown file
    const inputPath = `./cv-versions/${CV_FILENAME}`;

    // Read the markdown content
    console.log(`Reading CV content from ${inputPath}...`);
    const markdownContent = await fs.readFile(inputPath, 'utf-8');

    // Create output directory if needed
    const outputDir = `./output/${SECTOR}/${OUTPUT_SUBDIR}`;
    await fs.mkdir(outputDir, { recursive: true });

    // Format PDF filename
    const pdfBaseName = CV_FILENAME.replace('.md', '').replace(/^dawn-/, 'Dawn_Zurick_Beilfuss_');
    const outputPath = path.join(outputDir, `${pdfBaseName}.pdf`);

    // Configure PDF options with styling
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
      headerText: `Dawn Zurick Beilfuss - ${JOB_TITLE}`,
      footerText: `Application for ${JOB_DEPARTMENT}${JOB_ID ? ' | Job ID: ' + JOB_ID : ''} | ${new Date().toLocaleDateString()}`,
      orientation: 'portrait',
      pdfTitle: `Dawn Zurick Beilfuss - ${JOB_TITLE} CV`,
      pdfAuthor: 'Dawn Zurick Beilfuss',
      pdfCreator: 'DZB CV Generator',
    };

    // Custom CSS styling
    const customCss = `
      h1 { 
        color: ${PRIMARY_COLOR}; 
        font-size: 20pt;
        text-align: center;
        margin-bottom: 4px;
      }
      h2 { 
        color: ${SECONDARY_COLOR}; 
        border-bottom: 1px solid ${SECONDARY_COLOR};
        font-size: 14pt;
      }
      h3 { 
        color: ${ACCENT_COLOR}; 
        margin-bottom: 4px;
        font-size: 12pt;
      }
      strong { color: ${ACCENT_COLOR}; }
      .state-header {
        background-color: ${BG_COLOR};
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
    console.log(`Generating tailored PDF for ${JOB_TITLE} position...`);
    await convertMarkdownToPdf(markdownContent, outputPath, pdfOptions);

    console.log(`Successfully created PDF at: ${outputPath}`);

    // Check if cover letter exists
    const coverLetterInputPath = `./${outputDir}/dawn-${OUTPUT_SUBDIR}-cover-letter.md`;
    try {
      const coverLetterStat = await fs.stat(coverLetterInputPath);

      if (coverLetterStat.isFile()) {
        const coverLetterContent = await fs.readFile(coverLetterInputPath, 'utf-8');
        const coverLetterOutputPath = path.join(
          outputDir,
          `${pdfBaseName.replace('_CV', '')}_Cover_Letter.pdf`
        );

        // Configure PDF options for cover letter
        const coverLetterPdfOptions = {
          ...pdfOptions,
          headerText: 'Dawn Zurick Beilfuss - Cover Letter',
          footerText: `${JOB_TITLE} Application | ${new Date().toLocaleDateString()}`,
          pdfTitle: 'Dawn Zurick Beilfuss - Cover Letter',
        };

        // Generate the cover letter PDF
        console.log('Generating cover letter PDF...');
        await convertMarkdownToPdf(
          coverLetterContent,
          coverLetterOutputPath,
          coverLetterPdfOptions
        );

        console.log(`Successfully created cover letter PDF at: ${coverLetterOutputPath}`);
      }
    } catch (error) {
      console.log('No matching cover letter found - skipping cover letter generation');
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    process.exit(1);
  }
}

main();
