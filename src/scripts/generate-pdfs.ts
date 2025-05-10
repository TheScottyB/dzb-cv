// Usage: pnpm tsx src/scripts/generate-pdfs.ts <job-posting-directory>
// Example: pnpm tsx src/scripts/generate-pdfs.ts job-postings/indeed-village-green-assistant-manager-palatine-il-4a0f6f67a3267662
//
// This script will look for source/Dawn_Zurick_Beilfuss_CV.md and source/Dawn_Zurick_Beilfuss_Cover_Letter.md in the given directory,
// and output HTML and PDF versions to generated/.

import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { getJobPostingFolderName } from '../shared/utils/job-metadata.js';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { marked } from 'marked';
import puppeteer, { Browser, PaperFormat } from 'puppeteer';
import { fileURLToPath } from 'url';

// Configuration
interface Config {
  sourceFileNames: {
    cv: string[];
    coverLetter: string[];
  };
  outputDir: string;
  pdfOptions: {
    format: PaperFormat;
    margin: {
      top: string;
      right: string;
      bottom: string;
      left: string;
    };
    printBackground: boolean;
  };
}

const config: Config = {
  sourceFileNames: {
    cv: ['cv.md', 'source/Dawn_Zurick_Beilfuss_CV.md', 'application/cv.md'],
    coverLetter: [
      'cover-letter.md',
      'source/Dawn_Zurick_Beilfuss_Cover_Letter.md',
      'application/cover-letter.md',
    ],
  },
  outputDir: 'application/generated',
  pdfOptions: {
    format: 'letter' as PaperFormat,
    margin: { top: '0.5in', right: '0.75in', bottom: '0.5in', left: '0.75in' },
    printBackground: true,
  },
};

// Error handling
class DocumentGenerationError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'DocumentGenerationError';
  }
}

// Logging utility
const logger = {
  info: (message: string) => console.log('\x1b[36m%s\x1b[0m', `[INFO] ${message}`),
  success: (message: string) => console.log('\x1b[32m%s\x1b[0m', `[SUCCESS] ${message}`),
  warn: (message: string) => console.log('\x1b[33m%s\x1b[0m', `[WARN] ${message}`),
  error: (message: string) => console.log('\x1b[31m%s\x1b[0m', `[ERROR] ${message}`),
};

async function resolveJobDir(jobDir: string): Promise<string> {
  try {
    const resolvedPath = path.resolve(jobDir);
    if (!existsSync(resolvedPath)) {
      throw new DocumentGenerationError(`Job directory not found: ${jobDir}`, 'DIR_NOT_FOUND');
    }

    // Check for job-data.json and verify standardization
    const jobDataPath = path.join(resolvedPath, 'job-data.json');
    if (existsSync(jobDataPath)) {
      const expectedFolderName = await getJobPostingFolderName(jobDataPath);
      if (expectedFolderName) {
        const expectedPath = path.join('job-postings', expectedFolderName);
        if (path.resolve(jobDir) !== path.resolve(expectedPath)) {
          logger.warn(
            `Folder name does not match standardized convention. Expected: ${expectedPath}`
          );
        }
      }
    } else {
      logger.warn('No job-data.json found in folder. Cannot verify standardization.');
    }

    return resolvedPath;
  } catch (error) {
    if (error instanceof DocumentGenerationError) {
      throw error;
    }
    throw new DocumentGenerationError(
      `Failed to resolve job directory: ${error.message}`,
      'DIR_RESOLVE_ERROR'
    );
  }
}

async function findSourceFile(jobDir: string, fileNames: string[]): Promise<string | null> {
  for (const fileName of fileNames) {
    const filePath = path.join(jobDir, fileName);
    if (existsSync(filePath)) {
      return filePath;
    }
  }
  return null;
}

async function convertMarkdownToHTML(markdownPath: string): Promise<string> {
  try {
    const markdown = readFileSync(markdownPath, 'utf-8');
    const htmlContent = marked(markdown);
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 0.25in;
      color: #333;
    }
    h1, h2, h3 { color: #2c5282; margin-bottom: 0.5em; }
    h1 { font-size: 24px; border-bottom: 2px solid #3182ce; }
    h2 { font-size: 20px; border-bottom: 1px solid #bee3f8; }
    h3 { font-size: 16px; }
    p { margin-bottom: 0.75em; }
    ul, ol { margin: 0.7em 0; padding-left: 1.5em; }
    li { margin: 0.5em 0; }
    .header-info { text-align: center; margin-bottom: 2em; }
    @media print {
      body { 
        font-size: 11pt;
        padding: 0;
      }
      h1 { font-size: 18pt; }
      h2 { font-size: 14pt; }
      h3 { font-size: 12pt; }
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;
  } catch (error) {
    throw new DocumentGenerationError(
      `Failed to convert markdown to HTML: ${error.message}`,
      'MARKDOWN_CONVERSION_ERROR'
    );
  }
}

async function convertHTMLToPDF(
  browser: Browser,
  html: string,
  outputPath: string,
  pdfOptions = config.pdfOptions
): Promise<void> {
  const page = await browser.newPage();
  try {
    await page.setContent(html);
    await page.pdf({ ...pdfOptions, path: outputPath });
  } catch (error) {
    throw new DocumentGenerationError(
      `Failed to convert HTML to PDF: ${error.message}`,
      'PDF_CONVERSION_ERROR'
    );
  } finally {
    await page.close();
  }
}

async function generatePDFsForJob(jobDir: string): Promise<void> {
  let browser: Browser | null = null;
  try {
    const resolvedJobDir = await resolveJobDir(jobDir);
    logger.info(`Processing job directory: ${resolvedJobDir}`);

    // Create output directory if it doesn't exist
    const outputDir = path.join(resolvedJobDir, config.outputDir);
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // Initialize browser
    browser = await puppeteer.launch();

    // Process CV
    const cvPath = await findSourceFile(resolvedJobDir, config.sourceFileNames.cv);
    if (cvPath) {
      logger.info(`Found CV at: ${cvPath}`);
      const cvHtml = await convertMarkdownToHTML(cvPath);
      const cvHtmlPath = path.join(outputDir, 'cv.html');
      const cvPdfPath = path.join(outputDir, 'cv.pdf');

      writeFileSync(cvHtmlPath, cvHtml);
      await convertHTMLToPDF(browser, cvHtml, cvPdfPath);
      logger.success('CV generated successfully');
    } else {
      logger.warn('No CV markdown file found');
    }

    // Process Cover Letter
    const coverLetterPath = await findSourceFile(
      resolvedJobDir,
      config.sourceFileNames.coverLetter
    );
    if (coverLetterPath) {
      logger.info(`Found Cover Letter at: ${coverLetterPath}`);
      const coverLetterHtml = await convertMarkdownToHTML(coverLetterPath);
      const coverLetterHtmlPath = path.join(outputDir, 'cover-letter.html');
      const coverLetterPdfPath = path.join(outputDir, 'cover-letter.pdf');

      writeFileSync(coverLetterHtmlPath, coverLetterHtml);
      await convertHTMLToPDF(browser, coverLetterHtml, coverLetterPdfPath);

      // Check cover letter length
      const pdfBytes = readFileSync(coverLetterPdfPath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      if (pdfDoc.getPageCount() > 1) {
        logger.warn('Cover letter is more than one page!');
      }

      logger.success('Cover Letter generated successfully');
    } else {
      logger.warn('No Cover Letter markdown file found');
    }
  } catch (error) {
    if (error instanceof DocumentGenerationError) {
      logger.error(`${error.code}: ${error.message}`);
    } else {
      logger.error(`Unexpected error: ${error.message}`);
    }
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Main execution
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);

if (isMainModule) {
  const jobDir = process.argv[2];
  if (!jobDir) {
    logger.error('Please provide a job directory path');
    process.exit(1);
  }

  generatePDFsForJob(jobDir)
    .then(() => {
      logger.success('PDF generation completed');
    })
    .catch(() => {
      process.exit(1);
    });
}

export { generatePDFsForJob };
