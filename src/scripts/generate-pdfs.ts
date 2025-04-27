// Usage: pnpm tsx src/scripts/generate-pdfs.ts <job-posting-directory>
// Example: pnpm tsx src/scripts/generate-pdfs.ts job-postings/indeed-village-green-assistant-manager-palatine-il-4a0f6f67a3267662
//
// This script will look for source/Dawn_Zurick_Beilfuss_CV.md and source/Dawn_Zurick_Beilfuss_Cover_Letter.md in the given directory,
// and output HTML and PDF versions to generated/.

import { MarkdownConverter } from '../utils/markdown-converter.js';
import { HTMLToPDFConverter } from '../utils/html-to-pdf.js';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { getJobPostingFolderName } from '../shared/utils/job-metadata.js';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { marked } from 'marked';

async function resolveJobDir(inputPath: string): Promise<string> {
  // If input is a job-data.json file, resolve the folder name
  if (inputPath.endsWith('job-data.json')) {
    const folderName = await getJobPostingFolderName(inputPath);
    if (!folderName) {
      throw new Error('Could not resolve folder name from job-data.json');
    }
    const jobDir = path.join('job-postings', folderName as string);
    console.log(chalk.green('📂 Resolved job posting folder:'), chalk.yellow(jobDir));
    return jobDir;
  }
  // If input is a folder, check for job-data.json and warn if not standardized
  const jobDataPath = path.join(inputPath, 'job-data.json');
  try {
    await fs.access(jobDataPath);
    const folderName = await getJobPostingFolderName(jobDataPath);
    if (!folderName) {
      throw new Error('Could not resolve folder name from job-data.json in folder');
    }
    const expectedDir = path.join('job-postings', folderName);
    if (path.resolve(inputPath) !== path.resolve(expectedDir)) {
      console.warn(
        chalk.yellow('⚠️  Warning:'),
        'Folder name does not match standardized convention. Expected:',
        chalk.cyan(expectedDir),
      );
    }
  } catch {
    console.warn(
      chalk.yellow('⚠️  Warning: No job-data.json found in folder. Cannot verify standardization.'),
    );
  }
  return inputPath;
}

async function generatePDFsForJob(jobDir: string) {
  // First try the direct application directory
  const cvMarkdownPaths = [
    path.join(jobDir, 'cv.md'),
    path.join(jobDir, 'source', 'Dawn_Zurick_Beilfuss_CV.md'),
  ];

  const coverLetterMarkdownPaths = [
    path.join(jobDir, 'cover-letter.md'),
    path.join(jobDir, 'source', 'Dawn_Zurick_Beilfuss_Cover_Letter.md'),
  ];

  // Try to find CV markdown
  let cvMarkdownPath: string | null = null;
  for (const p of cvMarkdownPaths) {
    if (existsSync(p)) {
      cvMarkdownPath = p;
      break;
    }
  }

  // Try to find cover letter markdown
  let coverLetterMarkdownPath: string | null = null;
  for (const p of coverLetterMarkdownPaths) {
    if (existsSync(p)) {
      coverLetterMarkdownPath = p;
      break;
    }
  }

  if (!cvMarkdownPath) {
    console.warn(chalk.yellow('⚠️ CV markdown not found at any of these locations:'));
    for (const p of cvMarkdownPaths) {
      console.warn(chalk.yellow(p));
    }
    console.warn(chalk.yellow('skipping.'));
  }

  if (!coverLetterMarkdownPath) {
    console.warn(chalk.yellow('⚠️ Cover Letter markdown not found at any of these locations:'));
    for (const p of coverLetterMarkdownPaths) {
      console.warn(chalk.yellow(p));
    }
    console.warn(chalk.yellow('skipping.'));
  }

  // Create generated directory if it doesn't exist
  const generatedDir = path.join(jobDir, 'generated');
  if (!existsSync(generatedDir)) {
    mkdirSync(generatedDir);
  }

  // Generate HTML and PDF for CV if markdown exists
  if (cvMarkdownPath) {
    const cvMarkdown = readFileSync(cvMarkdownPath, 'utf8');
    const cvHtml = marked.parse(cvMarkdown);
    writeFileSync(path.join(generatedDir, 'cv.html'), cvHtml);
    await convertHTMLToPDF(path.join(generatedDir, 'cv.html'), path.join(generatedDir, 'cv.pdf'));
    console.log(chalk.green('✓ Generated CV HTML and PDF'));
  }

  // Generate HTML and PDF for cover letter if markdown exists
  if (coverLetterMarkdownPath) {
    const coverLetterMarkdown = readFileSync(coverLetterMarkdownPath, 'utf8');
    const coverLetterHtml = marked.parse(coverLetterMarkdown);
    writeFileSync(path.join(generatedDir, 'cover-letter.html'), coverLetterHtml);
    await convertHTMLToPDF(
      path.join(generatedDir, 'cover-letter.html'),
      path.join(generatedDir, 'cover-letter.pdf'),
    );
    console.log(chalk.green('✓ Generated Cover Letter HTML and PDF'));

    // Check if cover letter is more than one page
    const pdfPath = path.join(generatedDir, 'cover-letter.pdf');
    const pdfBytes = readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    if (pdfDoc.getPageCount() > 1) {
      console.warn(chalk.yellow('⚠️ Warning: Cover letter is more than one page!'));
    }
  }
}

// Accept CLI argument for job posting directory or job-data.json
const [, , inputPath] = process.argv;
if (!inputPath) {
  console.error(
    'Usage: pnpm tsx src/scripts/generate-pdfs.ts <job-posting-directory|job-data.json>',
  );
  process.exit(1);
}

resolveJobDir(inputPath)
  .then(generatePDFsForJob)
  .catch((err) => {
    console.error(chalk.red('❌'), err.message || err);
    process.exit(1);
  });
