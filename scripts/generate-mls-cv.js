#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import { convertMarkdownToPdf } from './pdf-generator.js';

// Register Handlebars helpers
handlebars.registerHelper('formatUSDate', function(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US');
});

handlebars.registerHelper('formatFederalDateRange', function(startDate, endDate) {
  if (!startDate) return '';
  const start = new Date(startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const end = endDate ? new Date(endDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Present';
  return `${start} - ${end}`;
});

// Job-specific configuration
const JOB_CONFIG = {
  title: "Medical Laboratory Scientist/Medical Laboratory Technician",
  department: "Mercyhealth",
  jobId: "39454",
  outputSubdir: "careers.mercyhealthsystem.org-39454",
  sector: "private",
  styling: {
    primaryColor: "#005A9C",  // Mercyhealth blue
    secondaryColor: "#2E7D32",
    accentColor: "#1B5E20",
    bgColor: "#F5F5F5"
  }
};

async function main() {
  try {
    // Load base info
    console.log('Loading base info...');
    const baseInfo = JSON.parse(await fs.readFile('./base-info.json', 'utf-8'));
    
    // Load job data
    console.log('Loading job data...');
    const jobDataPath = `./job-postings/${JOB_CONFIG.outputSubdir}/job-data.json`;
    const jobData = JSON.parse(await fs.readFile(jobDataPath, 'utf-8'));
    
    // Merge data for CV
    const cvData = {
      ...baseInfo,
      jobInfo: {
        title: JOB_CONFIG.title,
        department: JOB_CONFIG.department,
        jobId: JOB_CONFIG.jobId,
        location: jobData.location,
        description: jobData.description,
        requirements: jobData.sections.education.text,
        responsibilities: jobData.sections.responsibilities.lists[0],
        benefits: jobData.sections.benefits.text
      },
      // Add relevant skills and experience sections
      relevantSkills: baseInfo.skills.healthcareAdministration,
      relevantExperience: baseInfo.workExperience.healthcare
    };
    
    // Create output directory
    const outputDir = `./job-postings/${JOB_CONFIG.outputSubdir}`;
    await fs.mkdir(outputDir, { recursive: true });
    
    // Generate CV
    console.log('Generating CV...');
    const templateContent = await fs.readFile(`./data/templates/${JOB_CONFIG.sector}/mls-template.md`, 'utf-8');
    const template = handlebars.compile(templateContent);
    const cvContent = template(cvData);
    
    // Save CV markdown
    const cvMarkdownPath = path.join(outputDir, 'Dawn_Zurick_Beilfuss_CV.md');
    await fs.writeFile(cvMarkdownPath, cvContent, 'utf-8');
    console.log(`Saved CV markdown to: ${cvMarkdownPath}`);
    
    // Generate CV PDF
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
      headerText: `Dawn Zurick Beilfuss - ${JOB_CONFIG.title}`,
      footerText: `Application for ${JOB_CONFIG.department} Position - Job ID: ${JOB_CONFIG.jobId} | ${new Date().toLocaleDateString()}`,
      orientation: 'portrait',
      pdfTitle: `Dawn Zurick Beilfuss - ${JOB_CONFIG.title} CV`,
      pdfAuthor: 'Dawn Zurick Beilfuss',
      pdfCreator: 'DZB CV Generator',
      customCss: `
        h1 { 
          color: ${JOB_CONFIG.styling.primaryColor}; 
          font-size: 20pt;
          text-align: center;
          margin-bottom: 4px;
        }
        h2 { 
          color: ${JOB_CONFIG.styling.secondaryColor}; 
          border-bottom: 1px solid ${JOB_CONFIG.styling.secondaryColor};
          font-size: 14pt;
        }
        h3 { 
          color: ${JOB_CONFIG.styling.accentColor}; 
          margin-bottom: 4px;
          font-size: 12pt;
        }
        strong { color: ${JOB_CONFIG.styling.accentColor}; }
        .header {
          background-color: ${JOB_CONFIG.styling.bgColor};
          padding: 8px;
          border-radius: 5px;
          margin-bottom: 15px;
        }
        ul li {
          margin-bottom: 5px;
        }
      `
    };
    
    const cvPdfPath = path.join(outputDir, 'Dawn_Zurick_Beilfuss_CV.pdf');
    await convertMarkdownToPdf(cvContent, cvPdfPath, pdfOptions);
    console.log(`Generated CV PDF at: ${cvPdfPath}`);
    
    // Generate cover letter content
    console.log('Generating cover letter...');
    const coverLetterContent = `# Cover Letter

Dear Hiring Manager,

I am writing to express my strong interest in the ${JOB_CONFIG.title} position at ${JOB_CONFIG.department}. With my extensive experience in healthcare administration and customer service, combined with my strong attention to detail and commitment to accuracy, I am confident in my ability to contribute effectively to your laboratory team.

My career has been built on a foundation of:
${cvData.relevantSkills.map(skill => `- ${skill}`).join('\n')}

I am particularly drawn to this opportunity because it aligns with my background in healthcare administration and my passion for ensuring excellent patient care through accurate and efficient medical services. My experience in:

- Managing high-volume patient flow and documentation
- Ensuring compliance with medical regulations and procedures
- Maintaining accurate records and attention to detail
- Working effectively in fast-paced medical environments
- Collaborating with healthcare professionals and support staff

makes me well-suited for the responsibilities of this position. I understand the critical nature of laboratory work and the importance of maintaining high standards of accuracy and precision in all aspects of the role.

I look forward to discussing how my skills and experience can benefit ${JOB_CONFIG.department} in more detail.

Best regards,
Dawn Zurick Beilfuss`;

    // Save cover letter markdown
    const coverLetterPath = path.join(outputDir, 'Dawn_Zurick_Beilfuss_Cover_Letter.md');
    await fs.writeFile(coverLetterPath, coverLetterContent, 'utf-8');
    console.log(`Saved cover letter markdown to: ${coverLetterPath}`);

    // Generate cover letter PDF
    const coverLetterPdfPath = path.join(outputDir, 'Dawn_Zurick_Beilfuss_Cover_Letter.pdf');
    await convertMarkdownToPdf(coverLetterContent, coverLetterPdfPath, {
      ...pdfOptions,
      headerText: 'Dawn Zurick Beilfuss - Cover Letter',
      pdfTitle: `Dawn Zurick Beilfuss - ${JOB_CONFIG.title} Cover Letter`
    });
    console.log(`Generated cover letter PDF at: ${coverLetterPdfPath}`);
    
  } catch (error) {
    console.error('Error generating documents:', error);
    process.exit(1);
  }
}

main(); 