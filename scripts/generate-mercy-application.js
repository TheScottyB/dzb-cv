import { promises as fs } from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { marked } from 'marked';

async function generatePDF(inputPath, outputPath, options = {}) {
  const markdown = await fs.readFile(inputPath, 'utf-8');

  // Configure marked for better HTML output
  marked.setOptions({
    headerIds: false,
    mangle: false,
    breaks: true,
  });

  const html = marked(markdown);

  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage();

    // Enhanced styling
    const styledHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            @page {
              size: letter;
              margin: 0.75in;
            }
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 8.5in;
              margin: 0 auto;
              padding: 0;
            }
            /* Contact info styling */
            p:first-of-type {
              text-align: center;
              margin-bottom: 1.5em;
              font-size: 1em;
            }
            /* Horizontal rule styling */
            hr {
              border: none;
              border-top: 1px solid #ccc;
              margin: 1.5em 0;
            }
            /* Heading styles */
            h1, h2 { 
              color: #222;
              margin-top: 1.2em;
              margin-bottom: 0.8em;
            }
            h2 { 
              border-bottom: 1px solid #999;
              padding-bottom: 0.3em;
              font-size: 1.3em;
            }
            /* List styling */
            ul {
              margin: 0.7em 0;
              padding-left: 1.2em;
            }
            li {
              margin: 0.4em 0;
              line-height: 1.4;
            }
            /* Bold text enhancement */
            strong {
              color: #222;
              font-weight: 600;
            }
            /* Cover letter specific */
            .letter-body {
              margin: 1em 0;
            }
            /* Professional experience section */
            .experience h3 {
              margin-bottom: 0.3em;
              color: #444;
            }
            /* Address block for cover letter */
            pre {
              font-family: Arial, sans-serif;
              margin: 1em 0;
              white-space: pre-wrap;
            }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;

    await page.setContent(styledHtml);

    const pdfOptions = {
      path: outputPath,
      format: 'Letter',
      margin: { top: '0.75in', right: '0.75in', bottom: '0.75in', left: '0.75in' },
      printBackground: true,
      displayHeaderFooter: false,
      preferCSSPageSize: true,
    };

    await page.pdf(pdfOptions);
    console.log(`Generated PDF: ${outputPath}`);
  } finally {
    await browser.close();
  }
}

async function main() {
  const applicationDir = process.argv[2];
  if (!applicationDir) {
    console.error('Please provide the application directory path');
    process.exit(1);
  }

  try {
    // Create output directory if it doesn't exist
    const outputDir = path.join(applicationDir, 'generated');
    await fs.mkdir(outputDir, { recursive: true });

    // Generate CV PDF
    const cvPath = path.join(applicationDir, 'cv.md');
    const cvOutputPath = path.join(outputDir, 'cv.pdf');
    await generatePDF(cvPath, cvOutputPath);

    // Generate Cover Letter PDF
    const coverPath = path.join(applicationDir, 'cover-letter.md');
    const coverOutputPath = path.join(outputDir, 'cover-letter.pdf');
    await generatePDF(coverPath, coverOutputPath);

    console.log('PDF generation completed successfully!');
  } catch (error) {
    console.error('Error generating PDFs:', error);
    process.exit(1);
  }
}

main();
