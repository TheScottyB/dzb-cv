import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { JobPosting, ScraperOptions, ScraperResult } from '../types/job-posting.js';

type RequiredScraperOptions = {
  headless: boolean;
  waitTime: number;
  outputDir: string;
  saveHtml: boolean;
  saveScreenshot: boolean;
  savePdf: boolean;
  customUserAgent?: string;
};

export class JobScraper {
  private options: RequiredScraperOptions;
  private browser: puppeteer.Browser | null = null;

  constructor(options: ScraperOptions = {}) {
    this.options = {
      headless: true,
      waitTime: 5000,
      outputDir: 'job-postings',
      saveHtml: true,
      saveScreenshot: true,
      savePdf: true,
      ...options
    };
  }

  private async ensureOutputDir(): Promise<string> {
    const outputDir = this.options.outputDir;
    await fs.mkdir(outputDir, { recursive: true });
    return outputDir;
  }

  private async extractJobInfo(page: puppeteer.Page): Promise<JobPosting> {
    const jobData = await page.evaluate(() => {
      const getText = (selector: string): string => {
        const element = document.querySelector(selector);
        return element?.textContent?.trim() || '';
      };

      const getList = (selector: string): string[] => {
        return Array.from(document.querySelectorAll(selector))
          .map(el => el.textContent?.trim())
          .filter((text): text is string => text !== undefined && text !== null) as string[];
      };

      return {
        title: getText('h1, .job-title, [role="heading"]'),
        company: getText('.company-name, .employer, [itemprop="hiringOrganization"]'),
        location: getText('.location, [itemprop="jobLocation"]'),
        description: getText('.job-description, [itemprop="description"]'),
        responsibilities: getList('.responsibilities li, .duties li'),
        qualifications: getList('.qualifications li, .requirements li'),
        skills: getList('.skills li, .competencies li'),
        education: getList('.education li, .requirements li'),
        experience: getList('.experience li, .requirements li'),
        metadata: {
          postedDate: getText('.posted-date, [itemprop="datePosted"]'),
          closingDate: getText('.closing-date, .application-deadline'),
          salary: getText('.salary, [itemprop="baseSalary"]'),
          employmentType: getText('.employment-type, [itemprop="employmentType"]')
        }
      };
    });

    return {
      url: page.url(),
      ...jobData,
      responsibilities: jobData.responsibilities,
      qualifications: jobData.qualifications,
      skills: jobData.skills,
      education: jobData.education,
      experience: jobData.experience,
      metadata: jobData.metadata
    };
  }

  async scrape(url: string): Promise<ScraperResult> {
    const startTime = Date.now();
    const result: ScraperResult = {
      success: false,
      metadata: {
        timestamp: new Date().toISOString(),
        duration: 0,
        url
      }
    };

    try {
      this.browser = await puppeteer.launch({
        headless: this.options.headless as boolean | "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await this.browser.newPage();
      if (this.options.customUserAgent) {
        await page.setUserAgent(this.options.customUserAgent);
      }

      await page.goto(url, { waitUntil: 'networkidle0' });
      await page.waitForTimeout(this.options.waitTime);

      const outputDir = await this.ensureOutputDir();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const baseFilename = `${url.split('/').pop()}-${timestamp}`;

      const jobPosting = await this.extractJobInfo(page);

      if (this.options.saveHtml) {
        const htmlPath = path.join(outputDir, `${baseFilename}.html`);
        await page.content().then(content => fs.writeFile(htmlPath, content));
        jobPosting.htmlPath = htmlPath;
      }

      if (this.options.saveScreenshot) {
        const screenshotPath = path.join(outputDir, `${baseFilename}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        jobPosting.screenshotPath = screenshotPath;
      }

      if (this.options.savePdf) {
        const pdfPath = path.join(outputDir, `${baseFilename}.pdf`);
        await page.pdf({ path: pdfPath, format: 'A4' });
        jobPosting.pdfPath = pdfPath;
      }

      const jsonPath = path.join(outputDir, `${baseFilename}.json`);
      await fs.writeFile(jsonPath, JSON.stringify(jobPosting, null, 2));

      result.success = true;
      result.data = jobPosting;

    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error occurred';
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
      result.metadata.duration = Date.now() - startTime;
    }

    return result;
  }
} 