import { PDFGeneratorImpl } from '../core/services/pdf/pdf-generator-impl.js';
import type { PDFGenerationOptions } from '../core/services/pdf/pdf-generator.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { marked } from 'marked';

async function generatePDFs() {
  const generator = new PDFGeneratorImpl();
  const timestamp = new Date().toISOString();

  // Configure PDF options
  const pdfOptions: Partial<PDFGenerationOptions> = {
    includeHeaderFooter: true,
    headerText: 'Dawn Zurick Beilfuss - Patient Access Supervisor',
    footerText: `Application for Mercyhealth Position - Job ID: 37949 | Generated: ${timestamp}`,
    paperSize: 'Letter',
    margins: {
      top: 0.75,
      right: 0.75,
      bottom: 0.75,
      left: 0.75
    },
    fontFamily: 'Arial, Helvetica, sans-serif',
    pdfTitle: 'Dawn Zurick Beilfuss - Patient Access Supervisor Application',
    pdfAuthor: 'Dawn Zurick Beilfuss',
    orientation: 'portrait'
  };

  // Read markdown files
  const cvMarkdown = await fs.readFile(
    path.join(process.cwd(), 'job-postings/mercy-health-37949/cv-draft.md'),
    'utf-8'
  );
  const coverLetterMarkdown = await fs.readFile(
    path.join(process.cwd(), 'job-postings/mercy-health-37949/cover-letter.md'),
    'utf-8'
  );

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
        <div class="date">April 24, 2024</div>
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
              <div class="contact-line">Mercyhealth Crystal Lake Hospital</div>
              <div class="contact-line">875 S. Route 31</div>
              <div class="contact-line">Crystal Lake, IL 60014</div>
            </div>
          </div>
        </div>
        <div class="content">
          ${marked(coverLetterMarkdown.split(/Dear Hiring Manager,/i)[1] || coverLetterMarkdown).toString()
            .replace(/<ul>/g, '<div class="skills-section"><div class="skills-grid">')
            .replace(/<\/ul>/g, '</div></div>')
            .replace(/<li>/g, '<div class="skill-item">')
            .replace(/<\/li>/g, '</div>')
            .replace(/My career has been built on a foundation of:/g, '<div class="skills-intro">My career has been built on a foundation of:</div>')}
        </div>
        <div class="timestamp">Generated: ${timestamp}</div>
      </body>
    </html>
  `;

  // Generate CV PDF
  console.log('Generating CV PDF...');
  const cvOutputPath = path.join(process.cwd(), 'job-postings/mercy-health-37949/Dawn_Zurick_Beilfuss_CV.pdf');
  await generator.generateFromHTML(cvHtml, cvOutputPath, pdfOptions);
  console.log(`Successfully created CV PDF at: ${cvOutputPath}`);

  // Generate Cover Letter PDF
  console.log('Generating Cover Letter PDF...');
  const coverOutputPath = path.join(process.cwd(), 'job-postings/mercy-health-37949/Dawn_Zurick_Beilfuss_Cover_Letter.pdf');
  await generator.generateFromHTML(coverLetterHtml, coverOutputPath, pdfOptions);
  console.log(`Successfully created Cover Letter PDF at: ${coverOutputPath}`);
}

generatePDFs().catch(console.error); 