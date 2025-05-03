import { readFile, writeFile } from 'fs/promises';
import { JobMatcher } from '../utils/job-matcher.js';
import { MarkdownConverter } from '../utils/markdown-converter.js';
import { HTMLToPDFConverter } from '../utils/html-to-pdf.js';
import path from 'node:path';
import fs from 'node:fs/promises';
import chalk from 'chalk';
import { getJobPostingFolderName } from '../shared/utils/job-metadata.js';

async function resolveJobDir(inputPath: string): Promise<{ jobDir: string; jobDataPath: string }> {
  // If input is a job-data.json file, resolve the folder name
  if (inputPath.endsWith('job-data.json')) {
    const folderName = await getJobPostingFolderName(inputPath);
    if (!folderName) {
      throw new Error('Could not resolve folder name from job-data.json');
    }
    const jobDir = path.join('job-postings', folderName);
    console.log(chalk.green('📂 Resolved job posting folder:'), chalk.yellow(jobDir));
    return { jobDir, jobDataPath: inputPath };
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
  return { jobDir: inputPath, jobDataPath };
}

async function main() {
  try {
    // Accept CLI argument for job posting directory or job-data.json
    const [, , inputPath] = process.argv;
    if (!inputPath) {
      console.error(
        'Usage: pnpm tsx src/scripts/analyze-job.ts <job-posting-directory|job-data.json>',
      );
      process.exit(1);
    }
    const { jobDir, jobDataPath } = await resolveJobDir(inputPath);

    // Read the job data
    const jobData = JSON.parse(await readFile(jobDataPath, 'utf-8'));

    // Create job matcher and analyze requirements
    const matcher = new JobMatcher();
    const matches = matcher.matchRequirements(jobData);

    // Generate tailored content
    const content = matcher.generateTailoredContent(matches);

    // Convert markdown to styled HTML
    const markdownConverter = new MarkdownConverter({
      primaryColor: '#006633', // Forest green
      accentColor: '#cc3333', // Red
      fontSize: '14px',
      lineHeight: '1.6',
    });

    const html = markdownConverter.convertToHTML(
      content,
      `Tailored CV for ${jobData.title}`,
      `${jobData.company}${jobData.location && jobData.location.city ? ' - ' + jobData.location.city : ''}${jobData.location && jobData.location.state ? ', ' + jobData.location.state : ''}`,
    );

    // Save the HTML for inspection in generated/
    const generatedDir = path.join(jobDir, 'generated');
    await fs.mkdir(generatedDir, { recursive: true });
    const htmlPath = path.join(generatedDir, 'tailored-cv.html');
    await writeFile(htmlPath, html);
    console.log(chalk.green('✅'), 'Generated HTML preview:', chalk.yellow(htmlPath));

    // Convert HTML to PDF
    const pdfConverter = new HTMLToPDFConverter();
    const pdfBuffer = await pdfConverter.convertToPDF(html, {
      format: 'Letter',
      landscape: false,
      margin: {
        top: '0.75in',
        right: '0.75in',
        bottom: '0.75in',
        left: '0.75in',
      },
      printBackground: true,
      scale: 1.0,
      pageRanges: '',
    });

    // Save the PDF in generated/
    const pdfPath = path.join(generatedDir, 'tailored-cv.pdf');
    await writeFile(pdfPath, pdfBuffer);
    console.log(chalk.green('✅'), 'Successfully generated tailored CV:', chalk.yellow(pdfPath));

    // Clean up
    await pdfConverter.close();
  } catch (error: any) {
    console.error(chalk.red('❌'), 'Error generating tailored CV:', error.message || error);
    process.exit(1);
  }
}

main();
