import { PDFGeneratorImpl } from '../core/services/pdf/pdf-generator-impl';
import type { PDFGenerationOptions } from '../core/services/pdf/pdf-generator';
import fs from 'node:fs/promises';
import path from 'node:path';
import { marked } from 'marked';
import chalk from 'chalk';
import { getJobPostingFolderName } from '../shared/utils/job-metadata';

interface JobData {
  title: string;
  company: string;
  jobId?: string;
  location?: {
    city?: string;
    state?: string;
  };
}

async function resolveJobDir(inputPath: string): Promise<{ jobDir: string; jobData: JobData }> {
  // If input is a job-data.json file, resolve the folder name
  if (inputPath.endsWith('job-data.json')) {
    const folderName = await getJobPostingFolderName(inputPath);
    if (!folderName) {
      throw new Error('Could not resolve folder name from job-data.json');
    }
    const jobDir = path.join('job-postings', folderName);
    console.log(chalk.green('📂 Resolved job posting folder:'), chalk.yellow(jobDir));
    const jobData = JSON.parse(await fs.readFile(inputPath, 'utf-8'));
    return { jobDir, jobData };
  }

  // If input is a folder, check for job-data.json
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
        chalk.cyan(expectedDir)
      );
    }
    const jobData = JSON.parse(await fs.readFile(jobDataPath, 'utf-8'));
    return { jobDir: inputPath, jobData };
  } catch (error) {
    throw new Error(`No job-data.json found in folder ${inputPath}`);
  }
}

async function generatePDFs(inputPath: string) {
  try {
    const { jobDir, jobData } = await resolveJobDir(inputPath);
    const generator = new PDFGeneratorImpl();
    const timestamp = new Date().toISOString();
    const generatedDir = path.join(jobDir, 'generated');
    await fs.mkdir(generatedDir, { recursive: true });

    // Configure PDF options
    const pdfOptions: Partial<PDFGenerationOptions> = {
      includeHeaderFooter: true,
      headerText: `Dawn Zurick Beilfuss - ${jobData.title}`,
      footerText: `Application for ${jobData.company} Position${jobData.jobId ? ` - Job ID: ${jobData.jobId}` : ''} | Generated: ${timestamp}`,
      paperSize: 'Letter',
      margins: {
        top: '0.75',
        right: '0.75',
        bottom: '0.75',
        left: '0.75',
      },
      fontFamily: 'Arial, Helvetica, sans-serif',
      pdfTitle: `Dawn Zurick Beilfuss - ${jobData.title} Application`,
      pdfAuthor: 'Dawn Zurick Beilfuss',
      orientation: 'portrait',
    };

    // Read markdown files
    console.log(chalk.blue('📄 Reading source files...'));
    const cvMarkdown = await fs.readFile(path.join(jobDir, 'cv-draft.md'), 'utf-8');
    const coverLetterMarkdown = await fs.readFile(path.join(jobDir, 'cover-letter.md'), 'utf-8');

    // Convert markdown to HTML with custom styling
    const cvHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, Helvetica, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 {
            color: #1a466b;
            text-align: center;
            margin-bottom: 20px;
          }
          h2 {
            color: #2874a6;
            border-bottom: 1px solid #2874a6;
            margin-top: 30px;
            padding-bottom: 5px;
          }
          h3 {
            color: #154360;
            margin-top: 20px;
          }
          .contact-info {
            text-align: center;
            margin-bottom: 30px;
          }
          .job-title {
            font-weight: bold;
          }
          .job-period {
            color: #666;
            font-style: italic;
          }
          ul {
            margin-left: 20px;
          }
          li {
            margin-bottom: 8px;
          }
          .timestamp {
            color: #999;
            font-size: 8pt;
            text-align: right;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        ${marked(cvMarkdown)}
        <div class="timestamp">Generated: ${timestamp}</div>
      </body>
    </html>
  `;

    const coverLetterHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Times New Roman', Times, serif;
            line-height: 1.45;
            color: #2c3e50;
            max-width: 8.5in;
            margin: 0 auto;
            padding: 0.25in 0.6in 0.25in;
            font-size: 10.5pt;
          }
          .date {
            text-align: center;
            margin-bottom: 1.2em;
            color: #34495e;
          }
          .header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2em;
            padding-bottom: 0.5em;
            border-bottom: 1px solid #eee;
          }
          .sender-info, .recipient-info {
            line-height: 1.2;
            color: #34495e;
          }
          .sender-info {
            text-align: left;
            padding-right: 1.5em;
            border-right: 1px solid #eee;
          }
          .recipient-info {
            text-align: right;
            padding-left: 1.5em;
          }
          .name {
            font-size: 12.5pt;
            color: #2c3e50;
            margin-bottom: 0.5em;
            letter-spacing: 0.02em;
          }
          .contact-group {
            margin-bottom: 0.3em;
          }
          .contact-line {
            margin-bottom: 0.15em;
          }
          .content {
            margin-top: 0;
          }
          p {
            margin: 0 0 1em 0;
            text-align: justify;
            letter-spacing: 0.01em;
          }
          .skills-section {
            margin: 0.8em 0;
            padding: 0.8em 1.5em;
            margin-left: 1em;
            margin-right: 1em;
            background: #f8f9fa;
            border-left: 2px solid #bdc3c7;
            line-height: 1.3;
          }
          .skills-intro {
            margin-bottom: 0.6em;
            color: #34495e;
            font-style: italic;
          }
          .skills-grid {
            gap: 0.3em;
          }
          .skill-item {
            padding-bottom: 0.3em;
          }
          .paragraph {
            margin-bottom: 1em;
          }
          .signature {
            margin-top: 1.6em;
            padding-top: 0.8em;
            border-top: 1px solid #eee;
          }
          .timestamp {
            position: fixed;
            bottom: 0.2in;
            right: 0.6in;
            color: #bdc3c7;
            font-size: 7pt;
            font-family: Arial, sans-serif;
          }
          .salutation {
            margin-bottom: 1.2em;
          }
          .closing {
            margin-top: 1.5em;
          }
          .address-group {
            margin-bottom: 0.4em;
          }
          .email {
            color: #2980b9;
          }
        </style>
      </head>
      <body>
        <div class="date">${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
        <div class="header">
          <div class="sender-info">
            <div class="name">Dawn Zurick Beilfuss</div>
            <div class="address-group">
              <div class="contact-line">15810 IL Rt. 173 #2F</div>
              <div class="contact-line">Harvard, IL 60033</div>
            </div>
            <div class="contact-group">
              <div class="contact-line">847.287.1148</div>
              <div class="contact-line email">DZ4100@gmail.com</div>
            </div>
          </div>
          <div class="recipient-info">
            <div class="contact-line" style="margin-bottom: 0.4em;">Hiring Manager</div>
            <div class="address-group">
              <div class="contact-line">${jobData.company}</div>
              ${jobData.location?.city ? `<div class="contact-line">${jobData.location.city}${jobData.location.state ? `, ${jobData.location.state}` : ''}</div>` : ''}
            </div>
          </div>
        </div>
        <div class="content">
          ${marked(coverLetterMarkdown.split(/Dear Hiring Manager,/i)[1] || coverLetterMarkdown)
            .toString()
            .replace(/<ul>/g, '<div class="skills-section"><div class="skills-grid">')
            .replace(/<\/ul>/g, '</div></div>')
            .replace(/<li>/g, '<div class="skill-item">')
            .replace(/<\/li>/g, '</div>')
            .replace(
              /My career has been built on a foundation of:/g,
              '<div class="skills-intro">My career has been built on a foundation of:</div>'
            )}
        </div>
        <div class="timestamp">Generated: ${timestamp}</div>
      </body>
    </html>
  `;

    // Generate CV PDF
    console.log(chalk.blue('🔨 Generating CV PDF...'));
    const cvOutputPath = path.join(generatedDir, 'Dawn_Zurick_Beilfuss_CV.pdf');
    await generator.generateFromHTML(cvHtml, cvOutputPath, pdfOptions);
    console.log(chalk.green('✅ CV PDF generated:'), chalk.yellow(cvOutputPath));

    // Generate Cover Letter PDF
    console.log(chalk.blue('🔨 Generating Cover Letter PDF...'));
    const coverLetterOutputPath = path.join(generatedDir, 'Dawn_Zurick_Beilfuss_Cover_Letter.pdf');
    await generator.generateFromHTML(coverLetterHtml, coverLetterOutputPath, pdfOptions);
    console.log(chalk.green('✅ Cover Letter PDF generated:'), chalk.yellow(coverLetterOutputPath));

    // Clean up
    console.log(chalk.green('✨ All PDFs generated successfully!'));
  } catch (error: any) {
    console.error(chalk.red('❌ Error generating PDFs:'), error.message || error);
    process.exit(1);
  }
}

// Check if file path is provided
if (process.argv.length < 3) {
  console.error(
    'Usage: pnpm tsx src/scripts/generate-mercyhealth-pdf.ts <job-posting-directory|job-data.json>'
  );
  process.exit(1);
}

generatePDFs(process.argv[2]);
