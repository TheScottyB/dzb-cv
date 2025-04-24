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
import type { JobPostingAnalysis, CVGenerationOptions, CVMatchResult, CVData } from './types/cv-types.js';
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

// Command to scrape a job posting with Puppeteer
program
  .command('scrape')
  .description('Scrape a job posting from a website using browser automation')
  .argument('<url>', 'The URL of the job posting to scrape')
  .option('--output <path>', 'Output directory for scraped files', 'output/scraped')
  .option('--no-headless', 'Run in non-headless mode (shows browser UI)')
  .option('--wait <ms>', 'Wait time in milliseconds after page load', '5000')
  .option('--no-screenshot', 'Do not save screenshot')
  .option('--pdf', 'Save PDF of the page')
  .option('--analyze', 'Analyze the scraped job posting after scraping')
  .option('--user-agent <string>', 'Custom user agent string to use')
  .addHelpText('after', `
Note: This command will automatically detect CAPTCHAs and verification challenges.
      If detected in headless mode, it will switch to visible browser mode and
      prompt you to solve the CAPTCHA manually before continuing.`)
  .action(async (url, options) => {
    try {
      console.log(chalk.blue.bold('🔍 Scraping job posting from browser...'));
      
      // Import the web scraper
      const { scrapeJobPosting } = await import('./utils/web-scraper.js');
      
      // Prepare scraper options
      const scraperOptions = {
        headless: options.headless,
        waitTime: parseInt(options.wait),
        outputDir: options.output,
        saveHtml: true,
        saveScreenshot: options.screenshot,
        savePdf: options.pdf,
        customUserAgent: options.userAgent
      };
      
      console.log(chalk.yellow('Launching browser and navigating to URL...'));
      console.log(chalk.gray(`This may take a moment. ${options.headless ? 'Browser is running in headless mode.' : 'Browser window will open.'}`));
      
      // Scrape the job posting
      const scrapedJob = await scrapeJobPosting(url, scraperOptions);
      
      console.log('\n' + chalk.green.bold('Job Successfully Scraped:'));
      console.log(chalk.gray('------------------------'));
      console.log(`Title: ${chalk.yellow(scrapedJob.title)}`);
      console.log(`Company: ${chalk.yellow(scrapedJob.company)}`);
      if (scrapedJob.location) console.log(`Location: ${chalk.yellow(scrapedJob.location)}`);
      
      console.log('\n' + chalk.green.bold('Saved Files:'));
      if (scrapedJob.htmlPath) console.log(`HTML: ${chalk.blue(scrapedJob.htmlPath)}`);
      if (scrapedJob.screenshotPath) console.log(`Screenshot: ${chalk.blue(scrapedJob.screenshotPath)}`);
      
      // Create a local job description file
      const jobDescriptionFile = path.join(options.output, `${scrapedJob.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.txt`);
      
      // Format the job description text
      const jobDescriptionContent = [
        `Job Title: ${scrapedJob.title}`,
        '',
        `Company: ${scrapedJob.company}`,
        '',
        scrapedJob.location ? `Location: ${scrapedJob.location}` : '',
        '',
        'Job Description:',
        '',
        scrapedJob.description,
        '',
        scrapedJob.responsibilities && scrapedJob.responsibilities.length > 0 ? 'Key Responsibilities:' : '',
        ...(scrapedJob.responsibilities || []).map(r => `- ${r}`),
        '',
        scrapedJob.qualifications && scrapedJob.qualifications.length > 0 ? 'Qualifications:' : '',
        ...(scrapedJob.qualifications || []).map(q => `- ${q}`)
      ].filter(Boolean).join('\n');
      
      await fs.writeFile(jobDescriptionFile, jobDescriptionContent, 'utf-8');
      console.log(`Job Description: ${chalk.blue(jobDescriptionFile)}`);
      
      // Analyze the job if requested
      if (options.analyze) {
        console.log('\n' + chalk.blue.bold('Analyzing scraped job...'));
        
        // Extract key terms using job analyzer
        const { extractKeyTerms } = await import('./utils/job-analyzer.js');
        const keyTerms = extractKeyTerms(scrapedJob.description);
        
        console.log('\n' + chalk.green.bold('Key Terms for CV Tailoring:'));
        console.log(chalk.yellow(keyTerms.join(', ')));
        
        // Prompt to generate CV
        const { proceedToTailoring } = await inquirer.prompt([{
          type: 'confirm',
          name: 'proceedToTailoring',
          message: 'Would you like to generate a tailored CV based on this job posting?',
          default: true
        }]);
        
        if (proceedToTailoring) {
          // Create a job analysis object from scraped data
          const jobAnalysis = {
            title: scrapedJob.title,
            company: scrapedJob.company,
            location: scrapedJob.location,
            responsibilities: scrapedJob.responsibilities || [],
            qualifications: scrapedJob.qualifications || [],
            keyTerms,
            source: {
              url,
              site: url.includes('indeed.com') ? 'Indeed' : 
                   url.includes('linkedin.com') ? 'LinkedIn' : 'Web',
              fetchDate: new Date()
            }
          };
          
          await createTailoredCV(jobAnalysis);
        }
      }
      
    } catch (error) {
      console.error(chalk.red('Error scraping job posting:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Command to analyze a job posting
program
  .command('analyze')
  .description('Analyze a job posting to extract key requirements and qualifications')
  .argument('<source>', 'The URL of the job posting to analyze or path to a local file')
  .option('--output <path>', 'Save analysis to a JSON file')
  .option('--force-generic', 'Force using the generic parser for any site')
  .option('--no-rate-limit', 'Disable rate limiting (use with caution)')
  .option('--file', 'Treat the source as a local file path instead of URL')
  .action(async (source, options) => {
    try {
      console.log(chalk.blue.bold('🔍 Analyzing job posting...'));
      
      let result;
      
      if (options.file) {
        // Handle local file analysis
        try {
          const fileContent = await fs.readFile(source, 'utf-8');
          console.log(chalk.green(`Successfully read job description from file: ${source}`));
          
          // Create a mock HTML document with the file content
          const mockHtml = `
            <!DOCTYPE html>
            <html>
              <head>
                <title>Job Description</title>
              </head>
              <body>
                <div class="job-description">
                  <pre>${fileContent}</pre>
                </div>
              </body>
            </html>
          `;
          
          // Use the generic parser with this HTML
          const { JSDOM } = await import('jsdom');
          const dom = new JSDOM(mockHtml);
          
          // Extract job title from the first line of the file
          const lines = fileContent.split('\n').filter(line => line.trim());
          const titleMatch = lines[0].match(/job title:?\s*(.*)/i);
          const title = titleMatch ? titleMatch[1].trim() : 'Unknown Position';
          
          // Extract company from the file (assuming it's in a format like "Company: XYZ")
          const companyMatch = fileContent.match(/company:?\s*(.*)/i);
          const company = companyMatch ? companyMatch[1].trim() : 'Unknown Company';
          
          // Extract location if present
          const locationMatch = fileContent.match(/location:?\s*(.*)/i);
          const location = locationMatch ? locationMatch[1].trim() : undefined;
          
          // Extract responsibilities section
          const responsibilitiesMatch = fileContent.match(/Key Responsibilities:[\s\S]*?(?=Qualifications:|Benefits:|$)/i);
          const responsibilitiesText = responsibilitiesMatch ? responsibilitiesMatch[0] : '';
          const responsibilities = responsibilitiesText
            .split('\n')
            .filter(line => line.trim().startsWith('-'))
            .map(line => line.replace(/^-\s*/, '').trim());
          
          // Extract qualifications section
          const qualificationsMatch = fileContent.match(/Qualifications:[\s\S]*?(?=Salary:|Benefits:|$)/i);
          const qualificationsText = qualificationsMatch ? qualificationsMatch[0] : '';
          const qualifications = qualificationsText
            .split('\n')
            .filter(line => line.trim().startsWith('-'))
            .map(line => line.replace(/^-\s*/, '').trim());
          
          // Extract key terms
          const jobAnalyzer = await import('./utils/job-analyzer.js');
          const keyTerms = jobAnalyzer.extractKeyTerms ? 
            jobAnalyzer.extractKeyTerms(fileContent) : 
            fileContent.toLowerCase()
              .split(/\W+/)
              .filter(word => word.length > 4)
              .filter((v, i, a) => a.indexOf(v) === i)
              .slice(0, 20);
          
          // Create job analysis object
          result = {
            title,
            company,
            location,
            responsibilities,
            qualifications,
            keyTerms,
            source: {
              url: `file://${source}`,
              site: 'Local File',
              fetchDate: new Date()
            }
          };
          
        } catch (error) {
          console.error(chalk.red(`Error reading or analyzing file: ${error instanceof Error ? error.message : String(error)}`));
          process.exit(1);
        }
      } else {
        // Regular URL analysis
        result = await analyzeJobPosting(source, {
          skipRateLimiting: !options.rateLimit,
          forceGenericParser: options.forceGeneric
        });
      }
      
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

// Command to generate a site-optimized CV
program
  .command('site-cv')
  .description('Generate a CV optimized for a specific job site')
  .argument('<site>', 'The job site to optimize for (indeed, linkedin, usajobs, monster)')
  .option('-o, --output <path>', 'Output directory for the generated CV', 'output/sites')
  .option('-f, --format <format>', 'Output format: pdf or docx', 'pdf')
  .option('--ats-friendly', 'Generate an ATS-friendly version with minimal formatting', false)
  .option('--include-all', 'Include all experience sections', false)
  .action(async (site, options) => {
    try {
      console.log(chalk.blue.bold(`🚀 Generating ${site.toUpperCase()} optimized CV...`));
      
      // Output directory will be handled inside the generateSiteOptimizedCV function
      
      // Load CV data
      const cvData = await loadCVData(path.join(__dirname, "data", "base-info.json"));
      
      // Format the CV based on the job site specifications
      await generateSiteOptimizedCV(site, cvData, options);
      
      console.log(chalk.green.bold(`✅ Successfully generated ${site.toUpperCase()} optimized CV!`));
      
    } catch (error) {
      console.error(chalk.red('Error generating site-optimized CV:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Command to create a full application
program
  .command('apply')
  .description('Run the complete job application workflow')
  .argument('<source>', 'The URL of the job posting to apply for or path to a local file')
  .option('-s, --sector <sector>', 'The sector for the CV (federal, state, private)', 'state')
  .option('-o, --output <path>', 'Base output directory', 'output')
  .option('--file', 'Treat the source as a local file path instead of URL')
  .action(async (source, options) => {
    try {
      console.log(chalk.blue.bold('🚀 Starting complete job application workflow'));
      console.log(chalk.gray('----------------------------------------'));
      
      // Step 1: Analyze the job posting
      console.log(chalk.blue('Step 1: Analyzing job posting...'));
      
      let jobAnalysis;
      
      if (options.file) {
        // Use the local file analysis logic similar to the analyze command
        const fileContent = await fs.readFile(source, 'utf-8');
        console.log(chalk.green(`Successfully read job description from file: ${source}`));
        
        // Extract job details from file
        const lines = fileContent.split('\n').filter(line => line.trim());
        const titleMatch = lines[0].match(/job title:?\s*(.*)/i);
        const title = titleMatch ? titleMatch[1].trim() : 'Unknown Position';
        
        const companyMatch = fileContent.match(/company:?\s*(.*)/i);
        const company = companyMatch ? companyMatch[1].trim() : 'Unknown Company';
        
        const locationMatch = fileContent.match(/location:?\s*(.*)/i);
        const location = locationMatch ? locationMatch[1].trim() : undefined;
        
        // Extract responsibilities section
        const responsibilitiesMatch = fileContent.match(/Key Responsibilities:[\s\S]*?(?=Qualifications:|Benefits:|$)/i);
        const responsibilitiesText = responsibilitiesMatch ? responsibilitiesMatch[0] : '';
        const responsibilities = responsibilitiesText
          .split('\n')
          .filter(line => line.trim().startsWith('-'))
          .map(line => line.replace(/^-\s*/, '').trim());
        
        // Extract qualifications section
        const qualificationsMatch = fileContent.match(/Qualifications:[\s\S]*?(?=Salary:|Benefits:|$)/i);
        const qualificationsText = qualificationsMatch ? qualificationsMatch[0] : '';
        const qualifications = qualificationsText
          .split('\n')
          .filter(line => line.trim().startsWith('-'))
          .map(line => line.replace(/^-\s*/, '').trim());
        
        // Extract key terms
        const jobAnalyzer = await import('./utils/job-analyzer.js');
        const keyTerms = jobAnalyzer.extractKeyTerms ? 
          jobAnalyzer.extractKeyTerms(fileContent) : 
          fileContent.toLowerCase()
            .split(/\W+/)
            .filter(word => word.length > 4)
            .filter((v, i, a) => a.indexOf(v) === i)
            .slice(0, 20);
        
        // Create job analysis object
        jobAnalysis = {
          title,
          company,
          location,
          responsibilities,
          qualifications,
          keyTerms,
          source: {
            url: `file://${source}`,
            site: 'Local File',
            fetchDate: new Date()
          }
        };
      } else {
        // Regular URL analysis
        jobAnalysis = await analyzeJobPosting(source, {});
      }
      
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

/**
 * Generates a CV optimized for specific job sites with appropriate formatting
 */
async function generateSiteOptimizedCV(
  site: string,
  cvData: CVData,
  options: any
): Promise<string> {
  // Normalize site name
  const siteLower = site.toLowerCase();
  
  // Create filename based on site
  const filename = `dawn-zurick-beilfuss-${siteLower}-optimized-cv`;
  
  // Site-specific settings
  const siteSettings: Record<string, any> = {
    indeed: {
      template: 'private',
      maxSections: options.includeAll ? 999 : 5,
      maxBullets: 8,
      emphasizeSections: ['realEstate', 'healthcare'],
      includeSummary: true,
      formatATS: options.atsFriendly,
      additionalContext: 'Optimized for Indeed - focuses on concise experience descriptions and key skills'
    },
    linkedin: {
      template: 'private',
      maxSections: options.includeAll ? 999 : 6,
      maxBullets: 10,
      emphasizeSections: ['realEstate', 'healthcare', 'foodIndustry'],
      includeSummary: true,
      formatATS: false,
      additionalContext: 'Optimized for LinkedIn - comprehensive experience with emphasis on management roles'
    },
    usajobs: {
      template: 'federal',
      maxSections: 999,
      maxBullets: 20,
      emphasizeSections: ['realEstate', 'healthcare'],
      includeSummary: true,
      formatATS: true,
      additionalContext: 'Optimized for USAJobs - detailed, comprehensive format following federal guidelines'
    },
    monster: {
      template: 'private',
      maxSections: options.includeAll ? 999 : 5,
      maxBullets: 6,
      emphasizeSections: ['realEstate', 'healthcare'],
      includeSummary: true,
      formatATS: options.atsFriendly,
      additionalContext: 'Optimized for Monster - concise with emphasis on key accomplishments'
    }
  };
  
  // Default to Indeed settings if site not recognized
  const settings = siteSettings[siteLower] || siteSettings.indeed;
  
  // Ensure we're using the appropriate output path, not in dist
  const outputPath = path.resolve(process.cwd(), options.output);
  
  // Ensure the directory exists
  await fs.mkdir(outputPath, { recursive: true });
  
  // Create a modified CV data copy for site-specific customization
  const siteOptimizedData = JSON.parse(JSON.stringify(cvData));
  
  // Add a note that this is a site-optimized version
  siteOptimizedData.professionalSummary = 
    `${siteOptimizedData.professionalSummary || ''}\n\n*${settings.additionalContext}*`;
  
  // Import handlebars to compile the template
  const Handlebars = await import('handlebars');
  
  // Load the template based on the site's preferred format
  const templatePath = path.join(__dirname, "templates", settings.template, `${settings.template}-template.md`);
  let templateContent = await fs.readFile(templatePath, 'utf-8');
  
  // Modify template for ATS-friendly format if requested
  if (settings.formatATS) {
    // Strip special Markdown formatting for ATS parsers
    templateContent = makeATSFriendly(templateContent);
  }
  
  // Prepare data for the template
  const templateData = {
    contact_info: `${cvData.personalInfo.contact.email} | ${cvData.personalInfo.contact.phone}${cvData.personalInfo.contact.address ? ' | ' + cvData.personalInfo.contact.address : ''}`,
    professional_summary: siteOptimizedData.professionalSummary,
    core_competencies: [
      "Real Estate Management",
      "Healthcare Administration",
      "Staff Training & Development",
      "Process Improvement",
      "Licensing & Compliance",
      "Customer Service Excellence"
    ],
    positions: [
      {
        title: "Managing Broker",
        company: "Vylla Home",
        start_date: "2018",
        end_date: "Present",
        achievements: [
          "Managed real estate operations for Chicago metropolitan area",
          "Led team of 20+ real estate agents through training and development",
          "Ensured compliance with state licensing requirements",
          "Streamlined transaction processes leading to 15% increase in efficiency"
        ],
        key_projects: [
          "Implemented new agent onboarding program",
          "Developed compliance tracking system"
        ]
      },
      {
        title: "Director of Operations",
        company: "Chiro One Wellness Centers",
        start_date: "2013",
        end_date: "2018",
        achievements: [
          "Oversaw operations for 12 healthcare clinics across Illinois",
          "Managed staffing, scheduling, and patient flow optimization",
          "Implemented new electronic health records system",
          "Improved patient satisfaction scores by 25%"
        ],
        key_projects: [
          "Clinic workflow redesign initiative",
          "Patient experience enhancement program"
        ]
      }
    ],
    education: [
      {
        degree: "Managing Broker License",
        institution: "State of Illinois",
        completion_date: "2018",
        additional_info: "License #471.XXXXXX"
      },
      {
        degree: "Bachelor of Science, Business Administration",
        institution: "University of Illinois",
        completion_date: "2005",
        additional_info: ""
      }
    ],
    skill_categories: [
      {
        category: "Real Estate",
        skills: "Transaction Management, Compliance, Agent Development, Market Analysis"
      },
      {
        category: "Healthcare",
        skills: "Operations Management, Staff Training, Patient Care, Regulatory Compliance"
      },
      {
        category: "Business",
        skills: "Team Leadership, Process Improvement, Customer Service, Strategic Planning"
      }
    ],
    certifications: [
      {
        certification: "Real Estate Managing Broker",
        issuing_body: "IL Department of Financial & Professional Regulation",
        date: "Current"
      },
      {
        certification: "Real Estate Broker",
        issuing_body: "WI Department of Safety & Professional Services",
        date: "Current"
      }
    ],
    affiliations: [
      "National Association of REALTORS®",
      "Illinois Association of REALTORS®",
      "Chicago Association of REALTORS®"
    ]
  };
  
  // Compile the template
  const template = Handlebars.default.compile(templateContent);
  
  // Generate markdown with compiled template
  const generatedMarkdown = template(templateData);
  
  // Generate markdown with site-specific template
  const markdownPath = path.join(outputPath, `${filename}.md`);
  
  // Create a custom header for the site-optimized version
  const siteHeader = 
    `# ${cvData.personalInfo.name.full}\n\n` +
    `*CV optimized for ${site.toUpperCase()} - Generated on ${new Date().toLocaleDateString()}*\n\n`;
  
  // Combine header with generated content
  const siteOptimizedMarkdown = siteHeader + generatedMarkdown;
  
  // Save markdown file
  await fs.writeFile(markdownPath, siteOptimizedMarkdown, 'utf-8');
  
  // Generate output in requested format
  if (options.format.toLowerCase() === 'pdf') {
    // PDF generation
    const pdfPath = path.join(outputPath, `${filename}.pdf`);
    
    // Configure PDF settings optimized for the job site
    const pdfOptions = {
      includeHeaderFooter: false, // Clean look for upload
      paperSize: 'Letter' as const,
      margins: {
        top: 0.75,
        right: 0.75,
        bottom: 0.75,
        left: 0.75
      },
      pdfTitle: `${cvData.personalInfo.name.full} - Resume`,
      pdfAuthor: cvData.personalInfo.name.full,
      orientation: 'portrait' as const
    };
    
    // Generate PDF
    await convertMarkdownToPdf(siteOptimizedMarkdown, pdfPath, pdfOptions);
    console.log(chalk.green(`Created site-optimized PDF for ${site}: ${filename}.pdf`));
    return pdfPath;
    
  } else if (options.format.toLowerCase() === 'docx') {
    // DOCX generation logic would go here
    // For now, we'll just return the markdown path since we don't have DOCX conversion yet
    console.log(chalk.yellow(`Note: DOCX generation not yet implemented. Created markdown file instead.`));
    return markdownPath;
  }
  
  return markdownPath;
}

/**
 * Makes markdown content more ATS-friendly by removing complex formatting
 */
function makeATSFriendly(content: string): string {
  // Replace complex markdown with simpler versions
  let atsFriendlyContent = content;
  
  // Remove italics and bold formatting but keep the text
  atsFriendlyContent = atsFriendlyContent.replace(/\*\*(.*?)\*\*/g, '$1');
  atsFriendlyContent = atsFriendlyContent.replace(/\*(.*?)\*/g, '$1');
  
  // Replace markdown links with just the text
  atsFriendlyContent = atsFriendlyContent.replace(/\[(.*?)\]\(.*?\)/g, '$1');
  
  // Replace fancy quotes with plain quotes
  atsFriendlyContent = atsFriendlyContent.replace(/[""]/g, '"');
  atsFriendlyContent = atsFriendlyContent.replace(/['']/g, "'");
  
  // Remove emojis
  atsFriendlyContent = atsFriendlyContent.replace(/[\u{1F600}-\u{1F64F}]/gu, '');
  
  // Simplify bullet points to plain dashes or asterisks
  atsFriendlyContent = atsFriendlyContent.replace(/•/g, '-');
  
  // Ensure proper spacing after headings
  atsFriendlyContent = atsFriendlyContent.replace(/#{1,6}\s+(.*?)\n/g, '$1\n\n');
  
  return atsFriendlyContent;
}

// Execute the CLI
program.parse();