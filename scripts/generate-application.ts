import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import { marked } from 'marked';
import { dawnTemplate } from '../src/templates/dawn-template.js';
import { PDFGeneratorImpl } from '../src/core/services/pdf/pdf-generator-impl.js';
import type { PDFGenerationOptions } from '../src/core/services/pdf/pdf-generator.js';

interface JobData {
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  skills: string[];
  jobDetails: {
    pay: string;
    type: string;
  };
  department?: string;
  qualifications: string[];
  requirements: string[];
  metadata: {
    jobId: string;
    scrapedAt: string;
    source: string;
    url: string;
  };
}

interface PDFOptions {
  paperSize: 'Letter' | 'A4' | 'Legal';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  fontFamily: string;
  fontSize: number;
  includeHeaderFooter: boolean;
  headerText?: string;
  footerText?: string;
  orientation: 'portrait' | 'landscape';
  pdfTitle: string;
  pdfAuthor: string;
  cssStylesheet?: string;
}

interface Education {
  degree: string;
  institution: string;
  period: string;
  achievements?: string[];
}

const CONTACT_INFO = {
  name: 'Dawn Zurick Beilfuss',
  address: '123 Healthcare Drive, Crystal Lake, IL 60014',
  phone: '(555) 123-4567',
  email: 'dawn.beilfuss@example.com',
};

const PROFESSIONAL_SUMMARY = `Healthcare professional with over 15 years of experience in patient care, medical office administration, and team leadership. Proven track record of improving operational efficiency, ensuring regulatory compliance, and delivering exceptional patient service.`;

async function generateApplication(jobId: string) {
  try {
    // Read job data
    const jobDir = join(process.cwd(), 'job-postings', jobId);
    const jobDataPath = join(jobDir, 'generated', 'job-data.json');
    const jobData: JobData = JSON.parse(await fs.readFile(jobDataPath, 'utf-8'));

    // Create output directory
    const outputDir = join(jobDir, 'application');
    await fs.mkdir(outputDir, { recursive: true });

    // Generate CV content based on job requirements
    const cvContent = await generateCV(jobData);
    const cvPath = join(outputDir, 'cv.md');
    await fs.writeFile(cvPath, cvContent);

    // Generate cover letter content
    const coverLetterContent = await generateCoverLetter(jobData);
    const coverLetterPath = join(outputDir, 'cover-letter.md');
    await fs.writeFile(coverLetterPath, coverLetterContent);

    // PDF styling
    const pdfOptions: Partial<PDFGenerationOptions> = {
      paperSize: 'Letter',
      margins: {
        top: '0.75in',
        right: '0.75in',
        bottom: '0.75in',
        left: '0.75in',
      },
      includeHeaderFooter: true,
      headerText: `Dawn Zurick Beilfuss - ${jobData.title}`,
      footerText: `Application for ${jobData.company} | ${new Date().toLocaleDateString()}`,
      orientation: 'portrait',
      pdfTitle: `Dawn Zurick Beilfuss - ${jobData.title}`,
      pdfAuthor: 'Dawn Zurick Beilfuss',
    };

    // Generate PDFs
    await generatePDFs(cvPath, coverLetterPath, outputDir, jobData, pdfOptions);

    console.log('Application materials generated successfully!');
    console.log('Output directory:', outputDir);
  } catch (error) {
    console.error('Error generating application:', error);
    process.exit(1);
  }
}

async function generateCV(jobData: JobData): Promise<string> {
  // Match Dawn's skills and experience with job requirements
  const relevantSkills = Object.values(dawnTemplate.coreStrengths)
    .flat()
    .filter((skill) =>
      jobData.skills.some((jobSkill) => jobSkill.toLowerCase().includes(skill.toLowerCase()))
    );

  const relevantExperience = Object.values(dawnTemplate.experiencePatterns).filter((exp) =>
    jobData.requirements.some((req) =>
      exp.keyDuties.some((duty) => req.toLowerCase().includes(duty.toLowerCase()))
    )
  );

  const education: Education[] = [
    {
      degree: 'Associate of Applied Science in Healthcare Administration',
      institution: 'McHenry County College',
      period: '2020 - Present',
      achievements: [
        "Dean's List: Fall 2020, Spring 2021",
        'Healthcare Management Student Association Member',
        'Focus on Medical Office Administration and Healthcare Technology',
      ],
    },
  ];

  // Generate CV content
  return `# ${CONTACT_INFO.name}
${CONTACT_INFO.address}
${CONTACT_INFO.phone} | ${CONTACT_INFO.email}

## Professional Summary
${PROFESSIONAL_SUMMARY}

## Relevant Skills
${relevantSkills.map((skill) => `- ${skill}`).join('\n')}

## Professional Experience
${relevantExperience
  .map(
    (exp) => `
### ${exp.title}
${exp.period}
${exp.keyDuties.map((duty) => `- ${duty}`).join('\n')}
`
  )
  .join('\n')}

## Education
${education
  .map(
    (edu) => `
### ${edu.degree}
${edu.institution} | ${edu.period}
${edu.achievements ? edu.achievements.map((achievement) => `- ${achievement}`).join('\n') : ''}
`
  )
  .join('\n')}
`;
}

async function generateCoverLetter(jobData: JobData): Promise<string> {
  const { title, company, department = '' } = jobData;

  // Match relevant experience and skills
  const relevantSkills = Object.values(dawnTemplate.coreStrengths)
    .flat()
    .filter((skill) =>
      jobData.skills.some((jobSkill) => jobSkill.toLowerCase().includes(skill.toLowerCase()))
    )
    .slice(0, 5);

  return `# Cover Letter

Dear Hiring Manager,

I am writing to express my strong interest in the ${title} position at ${company}${department ? ` in the ${department} department` : ''}. With my extensive experience in healthcare administration and customer service, combined with my strong attention to detail and commitment to accuracy, I am confident in my ability to contribute effectively to your team.

My career has been built on a foundation of:
${relevantSkills.map((skill) => `- ${skill}`).join('\n')}

I am particularly drawn to this opportunity because it aligns with my background in healthcare administration and my passion for ensuring excellent patient care through accurate and efficient medical services. My experience in:

- Managing high-volume patient flow and documentation
- Ensuring compliance with medical regulations and procedures
- Maintaining accurate records and attention to detail
- Working effectively in fast-paced medical environments
- Collaborating with healthcare professionals and support staff

makes me well-suited for the responsibilities of this position.

I look forward to discussing how my skills and experience can benefit ${company} in more detail.

Best regards,
Dawn Zurick Beilfuss`;
}

function generateCustomCSS(company: string): string {
  // Define company-specific colors
  const colors = {
    primary: '#1a466b',
    secondary: '#2874a6',
    accent: '#154360',
    background: '#f8f9fa',
  };

  return `
    body {
      font-family: Georgia, serif;
      line-height: 1.6;
      color: #333;
    }
    h1 { 
      color: ${colors.primary}; 
      font-size: 20pt;
      text-align: center;
      margin-bottom: 4px;
    }
    h2 { 
      color: ${colors.secondary}; 
      border-bottom: 1px solid ${colors.secondary};
      font-size: 14pt;
      margin-top: 20px;
    }
    h3 { 
      color: ${colors.accent}; 
      margin-bottom: 4px;
      font-size: 12pt;
    }
    .contact-info {
      text-align: center;
      margin-bottom: 20px;
    }
    ul li {
      margin-bottom: 5px;
    }
    @media print {
      body { padding: 0; }
      .page-break { page-break-after: always; }
      h1, h2, h3 { page-break-after: avoid; }
      li { page-break-inside: avoid; }
    }
  `;
}

async function generatePDFs(
  cvPath: string,
  coverLetterPath: string,
  outputDir: string,
  jobData: JobData,
  options: Partial<PDFGenerationOptions>
) {
  const pdfGenerator = new PDFGeneratorImpl();

  // Generate HTML with custom styling
  const customCSS = generateCustomCSS(jobData.company);
  const cvHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>${customCSS}</style>
    </head>
    <body>
      ${await fs.readFile(cvPath, 'utf-8')}
    </body>
    </html>
  `;

  const coverLetterHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>${customCSS}</style>
    </head>
    <body>
      ${await fs.readFile(coverLetterPath, 'utf-8')}
    </body>
    </html>
  `;

  // Generate PDFs with proper options
  const pdfOptions: Partial<PDFGenerationOptions> = {
    paperSize: 'Letter',
    margins: {
      top: '0.75in',
      right: '0.75in',
      bottom: '0.75in',
      left: '0.75in',
    },
    includeHeaderFooter: true,
    headerText: `Dawn Zurick Beilfuss - ${jobData.title}`,
    footerText: `Application for ${jobData.company} | ${new Date().toLocaleDateString()}`,
    orientation: 'portrait',
    pdfTitle: `Dawn Zurick Beilfuss - ${jobData.title}`,
    pdfAuthor: 'Dawn Zurick Beilfuss',
  };

  await pdfGenerator.generateFromHTML(cvHtml, join(outputDir, 'cv.pdf'), pdfOptions);
  await pdfGenerator.generateFromHTML(
    coverLetterHtml,
    join(outputDir, 'cover-letter.pdf'),
    pdfOptions
  );
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const jobId = process.argv[2];
  if (!jobId) {
    console.error('Please provide a job ID');
    process.exit(1);
  }
  generateApplication(jobId);
}
