#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { convertMarkdownToPdf } from '../dist/utils/pdf-generator.js';

/**
 * Generate PDFs for Mercyhealth application
 */
async function main() {
  try {
    const jobId = '37949';
    const baseDir = `./job-postings/mercy-health-${jobId}`;

    // Configure PDF options with Mercyhealth-specific styling
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
      headerText: 'Dawn Zurick Beilfuss - Patient Access Supervisor',
      footerText: `Application for Mercyhealth Position - Job ID: ${jobId} | ${new Date().toLocaleDateString()}`,
      orientation: 'portrait',
      pdfTitle: 'Dawn Zurick Beilfuss - Patient Access Supervisor Application',
      pdfAuthor: 'Dawn Zurick Beilfuss',
      pdfCreator: 'DZB CV Generator',
    };

    // Custom CSS styling for Mercyhealth application
    const customCss = `
      body {
        font-family: Georgia, serif;
        line-height: 1.6;
        color: #333;
      }
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
        margin-top: 20px;
      }
      h3 { 
        color: #154360; 
        margin-bottom: 4px;
        font-size: 12pt;
      }
      .contact-info {
        text-align: center;
        margin-bottom: 20px;
      }
      .job-title {
        font-weight: bold;
        margin-bottom: 4px;
      }
      .date {
        color: #666;
      }
      ul li {
        margin-bottom: 5px;
      }
      .sender-info {
        text-align: right;
        margin-bottom: 20px;
      }
      .recipient-info {
        margin-bottom: 20px;
      }
      .paragraph {
        margin-bottom: 15px;
        text-align: justify;
      }
      .signature {
        margin-top: 40px;
      }
      @media print {
        body {
          padding: 0;
        }
        .page-break {
          page-break-after: always;
        }
        h1, h2, h3 {
          page-break-after: avoid;
        }
        li {
          page-break-inside: avoid;
        }
      }
    `;

    pdfOptions.cssStylesheet = customCss;

    // Generate CV PDF
    console.log('Generating CV PDF...');
    const cvMarkdown = await fs.readFile(path.join(baseDir, 'cv.md'), 'utf-8');
    const cvOutputPath = path.join(baseDir, 'Dawn_Zurick_Beilfuss_CV.pdf');
    await convertMarkdownToPdf(cvMarkdown, cvOutputPath, pdfOptions);
    console.log(`Successfully created CV PDF at: ${cvOutputPath}`);

    // Generate Cover Letter PDF
    console.log('Generating Cover Letter PDF...');
    const coverMarkdown = await fs.readFile(path.join(baseDir, 'cover-letter.md'), 'utf-8');
    const coverOutputPath = path.join(baseDir, 'Dawn_Zurick_Beilfuss_Cover_Letter.pdf');
    await convertMarkdownToPdf(coverMarkdown, coverOutputPath, pdfOptions);
    console.log(`Successfully created Cover Letter PDF at: ${coverOutputPath}`);
  } catch (error) {
    console.error('Error generating PDFs:', error);
    process.exit(1);
  }
}

main();
