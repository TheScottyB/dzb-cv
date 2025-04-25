#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { convertMarkdownToPdf } from './pdf-generator.js';

// Job-specific configuration
const JOB_TITLE = "Medical Laboratory Scientist/Medical Laboratory Technician";
const JOB_DEPARTMENT = "Mercyhealth";
const JOB_ID = "39454";
const _OUTPUT_SUBDIR = "mercyhealth";
const _SECTOR = "healthcare";
const PRIMARY_COLOR = "#005A9C";  // Mercyhealth blue
const SECONDARY_COLOR = "#2E7D32";
const ACCENT_COLOR = "#1B5E20";
const BG_COLOR = "#F5F5F5";

async function main() {
  try {
    // Create output directory if needed
    const outputDir = `./job-postings/careers.mercyhealthsystem.org-39454`;
    await fs.mkdir(outputDir, { recursive: true });
    
    // Read the template and job data
    const templatePath = './data/templates/private/private-template.md';
    const jobDataPath = './job-postings/careers.mercyhealthsystem.org-39454/job-data.json';
    
    console.log(`Reading template from ${templatePath}...`);
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    
    console.log(`Reading job data from ${jobDataPath}...`);
    const jobData = JSON.parse(await fs.readFile(jobDataPath, 'utf-8'));
    
    // Generate CV content from template
    const cvContent = templateContent.replace(/{{JOB_TITLE}}/g, JOB_TITLE)
                                   .replace(/{{COMPANY}}/g, JOB_DEPARTMENT)
                                   .replace(/{{JOB_ID}}/g, JOB_ID);
    
    // Save CV markdown
    const cvMarkdownPath = path.join(outputDir, 'cv-draft.md');
    await fs.writeFile(cvMarkdownPath, cvContent);
    console.log(`Saved CV markdown to: ${cvMarkdownPath}`);
    
    // Configure PDF options with styling
    const pdfOptions = {
      paperSize: 'Letter',
      margins: {
        top: 0.75,
        right: 0.75,
        bottom: 0.75,
        left: 0.75
      },
      fontFamily: 'Georgia, serif',
      fontSize: 11,
      includeHeaderFooter: true,
      headerText: `Dawn Zurick Beilfuss - ${JOB_TITLE}`,
      footerText: `Application for ${JOB_DEPARTMENT} Position - Job ID: ${JOB_ID} | ${new Date().toLocaleDateString()}`,
      orientation: 'portrait',
      pdfTitle: `Dawn Zurick Beilfuss - ${JOB_TITLE} CV`,
      pdfAuthor: 'Dawn Zurick Beilfuss',
      pdfCreator: 'DZB CV Generator'
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
      .header {
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
    
    // Generate CV PDF
    console.log('Generating CV PDF...');
    const cvOutputPath = path.join(outputDir, 'Dawn_Zurick_Beilfuss_CV.pdf');
    await convertMarkdownToPdf(cvContent, cvOutputPath, pdfOptions);
    console.log(`Successfully created CV PDF at: ${cvOutputPath}`);

    // Generate cover letter content
    const coverLetterContent = `# Cover Letter

Dear Hiring Manager,

I am writing to express my strong interest in the ${JOB_TITLE} position at ${JOB_DEPARTMENT}. With my extensive experience in healthcare administration and customer service, I am confident in my ability to contribute effectively to your team.

My career has been built on a foundation of:
- Strong attention to detail and accuracy in medical documentation
- Experience with healthcare systems and patient data management
- Excellent customer service and communication skills
- Ability to work effectively in fast-paced medical environments
- Commitment to maintaining patient confidentiality and HIPAA compliance

I am particularly drawn to this opportunity because it aligns perfectly with my background in healthcare administration and my passion for ensuring excellent patient care through accurate and efficient laboratory services.

I look forward to discussing how my skills and experience can benefit ${JOB_DEPARTMENT} in more detail.

Best regards,
Dawn Zurick Beilfuss`;

    // Save cover letter markdown
    const coverLetterPath = path.join(outputDir, 'cover-letter.md');
    await fs.writeFile(coverLetterPath, coverLetterContent);
    console.log(`Saved cover letter markdown to: ${coverLetterPath}`);

    // Generate cover letter PDF
    console.log('Generating cover letter PDF...');
    const coverLetterOutputPath = path.join(outputDir, 'Dawn_Zurick_Beilfuss_Cover_Letter.pdf');
    
    const coverLetterOptions = {
      ...pdfOptions,
      headerText: 'Dawn Zurick Beilfuss - Cover Letter',
      pdfTitle: `Dawn Zurick Beilfuss - ${JOB_TITLE} Cover Letter`
    };
    
    await convertMarkdownToPdf(coverLetterContent, coverLetterOutputPath, coverLetterOptions);
    console.log(`Successfully created cover letter PDF at: ${coverLetterOutputPath}`);
    
  } catch (error) {
    console.error('Error generating documents:', error);
    process.exit(1);
  }
}

main();
