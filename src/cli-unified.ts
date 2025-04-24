#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { analyzeJobPosting } from './utils/job-analyzer.js';
import { generateCV } from './generator.js';
import { parseCvMarkdown } from './utils/cv-parser.js';
import { ProfileService } from './services/profile-service.js';
import type { JobPostingAnalysis, CVGenerationOptions, CVMatchResult } from './types/cv-types.js';
import { loadCVData } from './utils/helpers.js';
import { convertMarkdownToPdf } from './utils/pdf-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create command line interface
const program = new Command();

program
  .name('cv-toolkit')
  .description('Dawn\'s CV Toolkit - A unified workflow for job applications')
  .version('1.0.0');

// Command to analyze a job posting
program
  .command('analyze')
  .description('Analyze a job posting to extract key requirements and qualifications')
  .argument('<url>', 'The URL of the job posting to analyze')
  .option('--output <path>', 'Save analysis to a JSON file')
  .option('--force-generic', 'Force using the generic parser for any site')
  .option('--no-rate-limit', 'Disable rate limiting (use with caution)')
  .action(async (url, options) => {
    try {
      console.log(chalk.blue.bold('🔍 Analyzing job posting...'));
      
      const result = await analyzeJobPosting(url, {
        skipRateLimiting: !options.rateLimit,
        forceGenericParser: options.forceGeneric
      });
      
      // Print summary to console
      console.log('\n' + chalk.green.bold('Job Analysis Summary:'));
      console.log(chalk.gray('---------------------'));
      console.log(`Title: ${chalk.yellow(result.title)}`);
      console.log(`Company: ${chalk.yellow(result.company)}`);
      if (result.location) console.log(`Location: ${chalk.yellow(result.location)}`);
      if (result.jobType) console.log(`Job Type: ${chalk.yellow(result.jobType)}`);
      if (result.experienceLevel) console.log(`Experience Level: ${chalk.yellow(result.experienceLevel)}`);
      
      console.log('\n' + chalk.green.bold('Key Terms for CV Tailoring:'));
      console.log(chalk.yellow(result.keyTerms.join(', ')));
      
      if (result.salaryRange) {
        const min = result.salaryRange.min ? `$${result.salaryRange.min.toLocaleString()}` : '?';
        const max = result.salaryRange.max ? `$${result.salaryRange.max.toLocaleString()}` : '?';
        const period = result.salaryRange.period || 'yearly';
        console.log(`\nSalary Range: ${chalk.green(min)} - ${chalk.green(max)} (${period})`);
      }
      
      // Save to file if output path is provided
      if (options.output) {
        const outputContent = JSON.stringify(result, null, 2);
        await fs.writeFile(options.output, outputContent);
        console.log(`\nFull analysis saved to: ${chalk.blue(options.output)}`);
      } else {
        console.log('\n' + chalk.green.bold('Responsibilities:'));
        result.responsibilities.forEach(r => console.log(`- ${r}`));
        
        console.log('\n' + chalk.green.bold('Qualifications:'));
        result.qualifications.forEach(q => console.log(`- ${q}`));
        
        if (result.educationRequirements && result.educationRequirements.length > 0) {
          console.log('\n' + chalk.green.bold('Education Requirements:'));
          result.educationRequirements.forEach(e => console.log(`- ${e}`));
        }
      }
      
      console.log('\n' + chalk.magenta.bold('CV Tailoring Suggestions:'));
      console.log('1. Highlight matching skills in your professional summary');
      console.log('2. Adjust your work experience descriptions to emphasize relevant responsibilities');
      console.log('3. Use similar terminology/keywords throughout your CV');
      console.log('4. Update your skills section to prioritize the most relevant ones');
      
      const { proceedToTailoring } = await inquirer.prompt([{
        type: 'confirm',
        name: 'proceedToTailoring',
        message: 'Would you like to generate a tailored CV based on this job posting?',
        default: true
      }]);
      
      if (proceedToTailoring) {
        await createTailoredCV(result);
      }
      
    } catch (error) {
      console.error(chalk.red('Error analyzing job posting:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Command to generate a CV
program
  .command('generate')
  .description('Generate a CV for a specific sector')
  .argument('<sector>', 'The sector to generate for (federal, state, private)')
  .option('-f, --format <format>', 'Output format: markdown or pdf', 'pdf')
  .option('-o, --output <path>', 'Output directory for the generated CV', 'output')
  .option('--filename <name>', 'Base filename for the generated CV')
  .action(async (sector, options) => {
    try {
      if (!['federal', 'state', 'private'].includes(sector)) {
        console.error(chalk.red('Invalid sector. Please choose: federal, state, or private'));
        process.exit(1);
      }
      
      console.log(chalk.blue.bold(`Generating ${sector} CV...`));
      
      const outputPath = path.join(options.output, sector);
      
      const cvOptions: Partial<CVGenerationOptions> = {
        format: options.format === 'pdf' ? 'pdf' : 'markdown',
        filename: options.filename
      };
      
      const generatedPath = await generateCV(sector, outputPath, cvOptions);
      
      console.log(chalk.green.bold('CV generated successfully!'));
      console.log(`Output: ${chalk.blue(generatedPath)}`);
      
    } catch (error) {
      console.error(chalk.red('Error generating CV:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Command to import a markdown CV
program
  .command('import')
  .description('Import a markdown CV into the profile management system')
  .argument('<file>', 'Path to the markdown file')
  .option('-o, --owner <name>', 'Name of the profile owner', 'Dawn Zurick Beilfuss')
  .action(async (file, options) => {
    try {
      // Check if file exists
      try {
        await fs.access(file);
      } catch (err) {
        console.error(chalk.red(`Error: File '${file}' does not exist.`));
        process.exit(1);
      }
      
      // Read the markdown file
      const markdownContent = await fs.readFile(file, 'utf8');
      
      console.log(chalk.blue.bold(`📄 Parsing CV markdown for ${options.owner}...`));
      
      // Parse the markdown into structured data using the specialized parser
      const profileData = parseCvMarkdown(markdownContent);
      
      console.log(chalk.green('✅ Parsing complete.'));
      console.log(chalk.yellow('📊 Found:'));
      console.log(`   - ${profileData.experience.length} work experiences`);
      console.log(`   - ${profileData.skills.length} skills`);
      console.log(`   - ${profileData.education.length} education entries`);
      console.log(`   - ${profileData.certifications.length} certifications`);
      
      // Create a profile service instance
      const profileService = new ProfileService();
      
      console.log(chalk.blue.bold(`💾 Creating profile for ${profileData.basicInfo.name || options.owner}...`));
      
      // Create a profile using the parsed data
      const profile = await profileService.createProfile(options.owner, profileData);
      
      console.log(chalk.green('✅ Profile created successfully!'));
      console.log(`   Profile ID: ${chalk.yellow(profile.id)}`);
      console.log(`   Version ID: ${chalk.yellow(profile.currentVersionId)}`);
      
    } catch (error) {
      console.error(chalk.red('❌ Error processing CV:'), error);
      process.exit(1);
    }
  });

// Command to create a full application
program
  .command('apply')
  .description('Run the complete job application workflow')
  .argument('<url>', 'The URL of the job posting to apply for')
  .option('-s, --sector <sector>', 'The sector for the CV (federal, state, private)', 'state')
  .option('-o, --output <path>', 'Base output directory', 'output')
  .action(async (url, options) => {
    try {
      console.log(chalk.blue.bold('🚀 Starting complete job application workflow'));
      console.log(chalk.gray('----------------------------------------'));
      
      // Step 1: Analyze the job posting
      console.log(chalk.blue('Step 1: Analyzing job posting...'));
      const jobAnalysis = await analyzeJobPosting(url, {});
      
      // Print job summary
      console.log('\n' + chalk.green.bold('Job Summary:'));
      console.log(`${chalk.yellow(jobAnalysis.title)} at ${chalk.yellow(jobAnalysis.company)}`);
      if (jobAnalysis.location) console.log(`Location: ${jobAnalysis.location}`);
      
      // Step 2: Generate tailored CV
      console.log('\n' + chalk.blue('Step 2: Creating tailored CV...'));
      const tailoredCvFileName = await createTailoredCV(jobAnalysis, options.sector);
      
      // Step 3: Generate cover letter
      console.log('\n' + chalk.blue('Step 3: Creating cover letter...'));
      const coverLetterPath = await createCoverLetter(jobAnalysis, options.sector);
      
      // Step 4: Log application to agent-comments.md
      console.log('\n' + chalk.blue('Step 4: Logging application in tracking file...'));
      await logJobApplication(jobAnalysis, tailoredCvFileName, coverLetterPath);
      
      console.log('\n' + chalk.green.bold('✅ Job application package complete!'));
      console.log(`CV: ${chalk.yellow(tailoredCvFileName)}`);
      console.log(`Cover Letter: ${chalk.yellow(coverLetterPath)}`);
      console.log(`Application tracked in agent-comments.md`);
      
      console.log('\n' + chalk.magenta.bold('Next Steps:'));
      console.log('1. Review and make any final adjustments to the CV');
      console.log('2. Review and personalize the cover letter');
      console.log('3. Submit your application package via the employer\'s system');
      
    } catch (error) {
      console.error(chalk.red('Error in application workflow:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

/**
 * Creates a tailored CV based on job analysis
 */
async function createTailoredCV(
  jobAnalysis: JobPostingAnalysis,
  sector?: string
): Promise<string> {
  try {
    // Determine the most appropriate sector if not provided
    if (!sector) {
      if (jobAnalysis.source.url.includes('usajobs.gov')) {
        sector = 'federal';
      } else if (jobAnalysis.company.toLowerCase().includes('state') || 
                 jobAnalysis.company.toLowerCase().includes('government') ||
                 jobAnalysis.company.toLowerCase().includes('department')) {
        sector = 'state';
      } else {
        sector = 'private';
      }
      
      // Confirm sector choice
      const { confirmedSector } = await inquirer.prompt([{
        type: 'list',
        name: 'confirmedSector',
        message: 'Which CV sector would you like to use?',
        choices: [
          { name: 'Federal Government', value: 'federal' },
          { name: 'State Government', value: 'state' },
          { name: 'Private Sector', value: 'private' }
        ],
        default: sector
      }]);
      
      sector = confirmedSector;
    }
    
    // Get the job requirements to emphasize
    const keyTerms = jobAnalysis.keyTerms;
    
    // Load CV data
    const cvData = await loadCVData(path.join(__dirname, "data", "base-info.json"));
    
    // Create a job-specific filename
    const safeJobTitle = jobAnalysis.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    const safeCompanyName = jobAnalysis.company
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    const filename = `dawn-${safeJobTitle}-${safeCompanyName}-cv`;
    
    // Create output directory
    const outputPath = path.join('output', sector as string);
    await fs.mkdir(outputPath, { recursive: true });
    
    // Create a tailored CV version in cv-versions directory
    const cvVersionsPath = path.join('cv-versions');
    await fs.mkdir(cvVersionsPath, { recursive: true });
    
    // Load sector-specific template
    const templatePath = path.join(__dirname, "templates", sector as string, `${sector}-template.md`);
    const template = await fs.readFile(templatePath, 'utf-8');
    
    // TODO: Actually tailor the template based on job requirements
    // This is a placeholder - in reality we would intelligently modify
    // the CV content to emphasize relevant skills and experience
    
    // For now, add a header that mentions this is tailored
    const tailoredMarkdown = 
      `# ${cvData.personalInfo.name.full}\n\n` +
      `*CV tailored for ${jobAnalysis.title} position at ${jobAnalysis.company}*\n\n` +
      template;
    
    // Save the tailored version
    const markdownPath = path.join(cvVersionsPath, `${filename}.md`);
    await fs.writeFile(markdownPath, tailoredMarkdown, 'utf-8');
    
    // Generate PDF
    const pdfOptions = {
      format: 'pdf' as const,
      pdfOptions: {
        includeHeaderFooter: true,
        headerText: `${cvData.personalInfo.name.full} - ${jobAnalysis.title} Application`,
        footerText: `Tailored for ${jobAnalysis.company} - Generated on ${new Date().toLocaleDateString()}`
      },
      filename
    };
    
    const pdfPath = path.join(outputPath, `${filename}.pdf`);
    await convertMarkdownToPdf(tailoredMarkdown, pdfPath, pdfOptions.pdfOptions);
    
    console.log(chalk.green(`Created tailored CV: ${filename}.pdf`));
    
    return pdfPath;
  } catch (error) {
    console.error(chalk.red('Error creating tailored CV:'), error);
    throw error;
  }
}

/**
 * Creates a cover letter for the job application
 */
async function createCoverLetter(
  jobAnalysis: JobPostingAnalysis,
  sector: string = 'state'
): Promise<string> {
  try {
    const cvData = await loadCVData(path.join(__dirname, "data", "base-info.json"));
    
    // Create a job-specific filename
    const safeJobTitle = jobAnalysis.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    const filename = `dawn-${safeJobTitle}-cover-letter`;
    
    // Create output directory
    const outputPath = path.join('output', sector);
    await fs.mkdir(outputPath, { recursive: true });
    
    // Generate a simple cover letter template
    // In a real implementation, this would be more sophisticated and tailored
    const coverLetterContent = 
      `# ${cvData.personalInfo.name.full}\n\n` +
      `${cvData.personalInfo.contact.email} | ${cvData.personalInfo.contact.phone}\n\n` +
      `${new Date().toLocaleDateString()}\n\n` +
      `${jobAnalysis.company}\n\n` +
      `RE: Application for ${jobAnalysis.title} Position\n\n` +
      `Dear Hiring Manager,\n\n` +
      `I am writing to express my interest in the ${jobAnalysis.title} position at ${jobAnalysis.company}. With my background in healthcare administration, real estate operations, and professional development, I believe I would be a valuable addition to your team.\n\n` +
      `My experience aligns well with the qualifications you are seeking. Some highlights include:\n\n` +
      `- [Insert tailored experience point 1 based on job requirements]\n` +
      `- [Insert tailored experience point 2 based on job requirements]\n` +
      `- [Insert tailored experience point 3 based on job requirements]\n\n` +
      `I am particularly drawn to this position because [Insert reason for interest in the role/company]. I am confident that my skills in [Insert 2-3 key skills matching job requirements] would enable me to make meaningful contributions to your organization.\n\n` +
      `Thank you for considering my application. I look forward to the opportunity to discuss how my experience and skills would benefit ${jobAnalysis.company}.\n\n` +
      `Sincerely,\n\n` +
      `${cvData.personalInfo.name.full}`;
    
    // Save the cover letter
    const coverLetterPath = path.join(outputPath, `${filename}.md`);
    await fs.writeFile(coverLetterPath, coverLetterContent, 'utf-8');
    
    // Generate PDF
    const pdfOptions = {
      includeHeaderFooter: true,
      headerText: `${cvData.personalInfo.name.full} - Cover Letter`,
      footerText: `Application for ${jobAnalysis.title} - Generated on ${new Date().toLocaleDateString()}`
    };
    
    const pdfPath = path.join(outputPath, `${filename}.pdf`);
    await convertMarkdownToPdf(coverLetterContent, pdfPath, pdfOptions);
    
    console.log(chalk.green(`Created cover letter: ${filename}.pdf`));
    
    return pdfPath;
  } catch (error) {
    console.error(chalk.red('Error creating cover letter:'), error);
    throw error;
  }
}

/**
 * Logs the job application to the agent-comments.md file
 */
async function logJobApplication(
  jobAnalysis: JobPostingAnalysis,
  cvPath: string,
  coverLetterPath: string
): Promise<void> {
  try {
    const agentCommentsPath = path.join('agent-comments.md');
    
    // Check if file exists
    let existingContent = '';
    try {
      existingContent = await fs.readFile(agentCommentsPath, 'utf-8');
    } catch (error) {
      // File doesn't exist yet, will create it
      existingContent = '# Job Application Tracking Log\n\n';
    }
    
    // Format today's date
    const today = new Date();
    const dateFormatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // Create entry for this job
    const newEntry = 
      `## ${jobAnalysis.title} at ${jobAnalysis.company}\n\n` +
      `**Date Applied:** ${dateFormatted}\n\n` +
      `**Job Source:** [${jobAnalysis.source.site}](${jobAnalysis.source.url})\n\n` +
      `**Job Details:**\n` +
      `- Title: ${jobAnalysis.title}\n` +
      `- Company: ${jobAnalysis.company}\n` +
      (jobAnalysis.location ? `- Location: ${jobAnalysis.location}\n` : '') +
      (jobAnalysis.jobType ? `- Job Type: ${jobAnalysis.jobType}\n` : '') +
      `\n**Key Requirements:**\n` +
      jobAnalysis.qualifications.map(q => `- ${q}`).join('\n') + '\n\n' +
      `**Materials Created:**\n` +
      `- CV: ${path.basename(cvPath)}\n` +
      `- Cover Letter: ${path.basename(coverLetterPath)}\n\n` +
      `**Strategy Notes:**\n` +
      `- [Note your strategy for this application]\n` +
      `- [Highlight which aspects of experience were emphasized]\n` +
      `- [Include any special considerations]\n\n` +
      `**Follow-up Actions:**\n` +
      `- [ ] Send thank you email after interview\n` +
      `- [ ] Follow up if no response within 2 weeks\n` +
      `- [ ] Connect with hiring manager on LinkedIn\n\n` +
      `---\n\n`;
    
    // Append new entry to existing content
    const updatedContent = existingContent + newEntry;
    
    // Write back to file
    await fs.writeFile(agentCommentsPath, updatedContent, 'utf-8');
    
    console.log(chalk.green(`Application tracked in ${agentCommentsPath}`));
    
  } catch (error) {
    console.error(chalk.red('Error logging job application:'), error);
    throw error;
  }
}

// Execute the CLI
program.parse();