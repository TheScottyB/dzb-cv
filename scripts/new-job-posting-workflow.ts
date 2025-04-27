import path from 'node:path';
import { readFile, writeFile, mkdir } from 'fs/promises';
import chalk from 'chalk';
import prompts from 'prompts';
import { scrapeJobPosting } from '../src/shared/tools/web-scraper.js';
import { getJobPostingFolderName } from '../src/shared/utils/job-metadata.js';

// --- Plugin Interface ---
export interface WorkflowPlugin {
  name: string;
  run(context: WorkflowContext): Promise<void>;
}

export interface WorkflowContext {
  jobDataPath: string;
  baseInfoPath: string;
  jobData: any;
  baseInfo: any;
  outputs: Record<string, any>;
  warnings: string[];
  jobDir: string;
  url?: string;
}

// --- Plugin Implementations ---

const scrapeAndSetup: WorkflowPlugin = {
  name: 'Scrape and Setup Job Posting',
  async run(ctx) {
    let url = ctx.url;
    if (!url) {
      const response = await prompts({
        type: 'text',
        name: 'url',
        message: 'Enter the job posting URL:',
        validate: (u: string) => (u && u.startsWith('http') ? true : 'Enter a valid URL'),
      });
      url = response.url;
    }
    if (!url) throw new Error('No URL provided');
    ctx.url = url;
    console.log(chalk.blue('🌐 Scraping job posting...'));
    // Scrape the job posting
    const tempDir = path.resolve('job-postings', 'latest');
    await mkdir(tempDir, { recursive: true });
    const jobData = await scrapeJobPosting(url, {
      outputDir: tempDir,
      headless: true,
      saveHtml: true,
      saveScreenshot: false,
      savePdf: false,
    });
    // Save job-data.json in tempDir
    const tempJobDataPath = path.join(tempDir, 'job-data.json');
    await writeFile(tempJobDataPath, JSON.stringify(jobData, null, 2), 'utf-8');
    // Use metadata utility to get standardized folder name
    const folderName = await getJobPostingFolderName(tempJobDataPath);
    if (!folderName) throw new Error('Could not generate folder name from scraped job data');
    const jobDir = path.resolve('job-postings', folderName);
    await mkdir(jobDir, { recursive: true });
    // Move job-data.json to new folder
    const jobDataPath = path.join(jobDir, 'job-data.json');
    await writeFile(jobDataPath, JSON.stringify(jobData, null, 2), 'utf-8');
    ctx.jobDataPath = jobDataPath;
    ctx.jobDir = jobDir;
    ctx.jobData = jobData;
    ctx.outputs.scrapedUrl = url;
    ctx.outputs.jobDir = jobDir;
    ctx.outputs.jobDataPath = jobDataPath;
    console.log(chalk.green('✅ Scraped and set up job posting at:'), chalk.yellow(jobDir));
  },
};

const compareJobToBase: WorkflowPlugin = {
  name: 'Compare Job to Base',
  async run(ctx) {
    ctx.outputs.comparison = {
      jobTitle: ctx.jobData.title || ctx.jobData.position,
      baseName: ctx.baseInfo.name,
    };
    console.log(chalk.blue('🔍 Compared job-data.json to base-info.json'));
  },
};

const generateTemplate: WorkflowPlugin = {
  name: 'Generate Template',
  async run(ctx) {
    const templatePath = path.join(ctx.jobDir, 'cv-template.md');
    await writeFile(
      templatePath,
      `# CV Template for ${ctx.jobData.title || ctx.jobData.position}\n\nBased on ${ctx.baseInfo.name}`,
    );
    ctx.outputs.templatePath = templatePath;
    console.log(chalk.green('📝 Generated CV template at:'), chalk.yellow(templatePath));
  },
};

const generateFinalOutputs: WorkflowPlugin = {
  name: 'Generate Final Outputs',
  async run(ctx) {
    const genDir = path.join(ctx.jobDir, 'generated');
    await mkdir(genDir, { recursive: true });
    ctx.outputs.finalPdf = path.join(genDir, 'final-cv.pdf');
    ctx.outputs.finalHtml = path.join(genDir, 'final-cv.html');
    await writeFile(ctx.outputs.finalPdf, 'PDF content');
    await writeFile(ctx.outputs.finalHtml, '<html>HTML content</html>');
    console.log(chalk.green('📄 Generated final outputs (PDF/HTML)'));
  },
};

const runPlugins: WorkflowPlugin = {
  name: 'Run Additional Plugins',
  async run(ctx) {
    ctx.outputs.score = 95;
    console.log(chalk.cyan('⚙️  Ran scoring/analysis plugins (simulated)'));
  },
};

const printSummary: WorkflowPlugin = {
  name: 'Print Summary',
  async run(ctx) {
    console.log(chalk.bold('\n=== Workflow Summary ==='));
    Object.entries(ctx.outputs).forEach(([key, value]) => {
      console.log(chalk.magenta(key + ':'), value);
    });
    if (ctx.warnings.length) {
      console.log(chalk.yellow('\nWarnings:'));
      ctx.warnings.forEach((w) => console.log(chalk.yellow('- ' + w)));
    }
    console.log(chalk.bold('========================\n'));
  },
};

// --- Main Workflow ---

async function main() {
  // Parse --url flag if present
  const urlFlagIndex = process.argv.indexOf('--url');
  let url: string | undefined = undefined;
  if (urlFlagIndex !== -1 && process.argv.length > urlFlagIndex + 1) {
    url = process.argv[urlFlagIndex + 1];
  }
  const baseInfoPath = path.resolve('base-info.json');
  const baseInfo = JSON.parse(await readFile(baseInfoPath, 'utf-8'));
  // Initial context (jobDataPath/jobDir will be set by scrapeAndSetup)
  const ctx: WorkflowContext = {
    jobDataPath: '',
    baseInfoPath,
    jobData: {},
    baseInfo,
    outputs: {},
    warnings: [],
    jobDir: '',
    url,
  };
  // List of plugins to run
  const plugins: WorkflowPlugin[] = [
    scrapeAndSetup,
    compareJobToBase,
    generateTemplate,
    generateFinalOutputs,
    runPlugins,
    printSummary,
  ];
  for (const plugin of plugins) {
    try {
      await plugin.run(ctx);
    } catch (err: any) {
      ctx.warnings.push(`Plugin ${plugin.name} failed: ${err.message || err}`);
    }
  }
}

main();
