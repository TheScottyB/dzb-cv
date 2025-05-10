import type { Page } from 'puppeteer';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir, writeFile } from 'fs/promises';

interface JobDetails {
  title?: string;
  company?: string;
  location?: string;
  description?: string;
  url: string;
  scrapedAt: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
const REQUIRED_SELECTORS = {
  title: 'h1',
  company: '.company-name',
  location: '.location',
  description: '.job-description',
};

class ScrapingError extends Error {
  constructor(
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ScrapingError';
  }
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function validatePage(page: Page): Promise<void> {
  const readyState = await page.evaluate(() => document.readyState);
  if (readyState !== 'complete') {
    throw new ScrapingError(`Page not ready, state: ${readyState}`);
  }

  for (const [key, selector] of Object.entries(REQUIRED_SELECTORS)) {
    const element = await page.$(selector);
    if (!element) {
      throw new ScrapingError(`Required element not found: ${key} (${selector})`);
    }
  }
}

async function extractJobDetails(page: Page): Promise<JobDetails> {
  const details: JobDetails = {
    url: page.url(),
    scrapedAt: new Date().toISOString(),
  };

  for (const [key, selector] of Object.entries(REQUIRED_SELECTORS)) {
    try {
      const text = await page.$eval(selector, (el: Element) => el.textContent?.trim());
      if (text) {
        (details as any)[key] = text;
      }
    } catch (error) {
      console.warn(
        `Failed to extract ${key} using selector ${selector}:`,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  return details;
}

async function saveJobFiles(jobId: string, page: Page, jobDetails: JobDetails): Promise<string> {
  const outputDir = join('job-postings', jobId, 'source');
  await mkdir(outputDir, { recursive: true });

  const files = {
    'screenshot.png': async () =>
      page.screenshot({
        path: join(outputDir, 'screenshot.png'),
        fullPage: true,
      }),
    'job-page.html': async () => writeFile(join(outputDir, 'job-page.html'), await page.content()),
    'job-details.json': async () =>
      writeFile(join(outputDir, 'job-details.json'), JSON.stringify(jobDetails, null, 2)),
  };

  const errors: Error[] = [];
  for (const [filename, saveFunc] of Object.entries(files)) {
    try {
      await saveFunc();
      console.log(`✓ Saved ${filename} to ${outputDir}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`✗ Failed to save ${filename}:`, errorMessage);
      errors.push(new Error(`Failed to save ${filename}: ${errorMessage}`));
    }
  }

  if (errors.length > 0) {
    throw new ScrapingError('Failed to save some files', { errors });
  }

  return outputDir;
}

async function scrapeWithPuppeteer(url: string, retryCount = 0): Promise<void> {
  try {
    console.log(`\n📄 Scraping job posting from: ${url}`);
    console.log(`Attempt ${retryCount + 1}/${MAX_RETRIES}`);

    const browser = await puppeteer.connect({
      browserURL: 'http://localhost:9222',
      defaultViewport: null,
    });

    const page = await browser.newPage();

    try {
      await page.goto(url, {
        timeout: 30000,
        waitUntil: ['domcontentloaded', 'networkidle0'],
      });

      await validatePage(page);

      const jobId = url.match(/jk=([^&]+)/)?.[1] || new Date().getTime().toString();
      const jobDetails = await extractJobDetails(page);
      const outputDir = await saveJobFiles(jobId, page, jobDetails);

      console.log('\n📊 Job Details Summary:');
      for (const [key, value] of Object.entries(jobDetails)) {
        if (key === 'scrapedAt') continue;
        console.log(`${key}: ${typeof value === 'string' ? value.slice(0, 50) + '...' : value}`);
      }
      console.log('\n💾 Files saved to:', outputDir);
    } finally {
      await browser.disconnect();
      console.log('🔌 Disconnected from browser');
    }
  } catch (error) {
    if (error instanceof ScrapingError) {
      console.error('\n❌ Scraping error:', error.message);
      if (error.details) console.error('Details:', error.details);
    } else {
      console.error(
        '\n❌ Unexpected error:',
        error instanceof Error ? error.message : String(error)
      );
    }

    if (retryCount < MAX_RETRIES - 1) {
      console.log(`\n🔄 Retrying in ${RETRY_DELAY}ms...`);
      await delay(RETRY_DELAY);
      return scrapeWithPuppeteer(url, retryCount + 1);
    }
    throw error;
  }
}

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error('❌ Please provide a job posting URL');
    process.exit(1);
  }

  if (!url.includes('indeed.com/viewjob')) {
    console.error('❌ Invalid URL: Must be an Indeed job posting URL');
    process.exit(1);
  }

  try {
    await scrapeWithPuppeteer(url);
  } catch (error) {
    console.error('\n💥 Fatal error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
