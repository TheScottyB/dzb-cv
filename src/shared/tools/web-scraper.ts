import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';

/**
 * Options for web scraping
 */
export interface ScraperOptions {
  headless?: boolean;
  waitTime?: number;
  outputDir?: string;
  saveHtml?: boolean;
  saveScreenshot?: boolean;
  savePdf?: boolean;
  customUserAgent?: string;
  viewport?: {
    width: number;
    height: number;
  };
  cookies?: Array<{
    name: string;
    value: string;
    domain: string;
  }>;
  useExistingBrowser?: boolean;
  cdpUrl?: string;
}

/**
 * Default scraper options
 */
const DEFAULT_SCRAPER_OPTIONS: ScraperOptions = {
  headless: true,
  waitTime: 5000,
  outputDir: 'output/scraped',
  saveHtml: true,
  saveScreenshot: true,
  savePdf: false,
  viewport: {
    width: 1920,
    height: 1080
  },
  // Latest Chrome user agent string with current version
  customUserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  // By default, don't use existing browser
  useExistingBrowser: false,
  // Default Chrome DevTools Protocol URL (when Chrome is started with --remote-debugging-port=9222)
  cdpUrl: 'http://localhost:9222'
};

/**
 * Result of a web scraping operation
 */
export interface ScraperResult {
  url: string;
  title: string;
  html: string;
  text: string;
  htmlPath?: string;
  screenshotPath?: string;
  pdfPath?: string;
  successful: boolean;
  error?: string;
}

/**
 * Scraped job posting data
 */
export interface ScrapedJobPosting {
  url: string;
  position: string;
  employer: string;
  description: string;
  location?: string | undefined;
  qualifications?: string[] | undefined;
  responsibilities?: string[] | undefined;
  skills?: string[] | undefined;
  education?: string[] | undefined;
  experience?: string[] | undefined;
  metadata?: {
    postedDate?: string | undefined;
    closingDate?: string | undefined;
    salary?: string | undefined;
    employmentType?: string | undefined;
  } | undefined;
  htmlPath?: string | undefined;
  screenshotPath?: string | undefined;
  pdfPath?: string | undefined;
}

/**
 * Scrape a job posting from Indeed or LinkedIn using Puppeteer
 * 
 * @param url The URL of the job posting to scrape
 * @param options Scraping options
 * @returns Scraped job posting data
 */
export async function scrapeJobPosting(
  url: string, 
  options: ScraperOptions = {}
): Promise<ScrapedJobPosting> {
  const mergedOptions = { ...DEFAULT_SCRAPER_OPTIONS, ...options };
  const { outputDir, saveHtml, saveScreenshot, savePdf, useExistingBrowser, cdpUrl } = mergedOptions;

  let browser: puppeteer.Browser;
  if (useExistingBrowser && cdpUrl) {
    browser = await puppeteer.connect({ browserURL: cdpUrl });
  } else {
    browser = await puppeteer.launch({ 
      headless: mergedOptions.headless ?? true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  try {
    const page = await browser.newPage();
    await page.setViewport(mergedOptions.viewport ?? DEFAULT_SCRAPER_OPTIONS.viewport!);
    await page.setUserAgent(mergedOptions.customUserAgent ?? DEFAULT_SCRAPER_OPTIONS.customUserAgent!);

    if (mergedOptions.cookies) {
      await page.setCookie(...mergedOptions.cookies);
    }

    await page.goto(url, { waitUntil: 'networkidle0' });
    // Use setTimeout instead of deprecated waitForTimeout
    await new Promise(resolve => setTimeout(resolve, mergedOptions.waitTime ?? DEFAULT_SCRAPER_OPTIONS.waitTime!));

    // Check for CAPTCHA
    if (await detectCaptcha(page)) {
      throw new Error('CAPTCHA detected on the page');
    }

    const html = await page.content();

    // Generate filenames
    const baseFilename = generateFilename(url);
    const htmlPath = saveHtml && outputDir ? path.join(outputDir, `${baseFilename}.html`) : undefined;
    const screenshotPath = saveScreenshot && outputDir ? path.join(outputDir, `${baseFilename}.png`) : undefined;
    const pdfPath = savePdf && outputDir ? path.join(outputDir, `${baseFilename}.pdf`) : undefined;

    // Save files
    if (htmlPath) await fs.writeFile(htmlPath, html, 'utf-8');
    if (screenshotPath) await page.screenshot({ path: screenshotPath, fullPage: true });
    if (pdfPath) await page.pdf({ path: pdfPath, format: 'A4' });

    // Extract job data
    const jobData = await extractJobData(page, htmlPath, screenshotPath);

    return jobData;
  } finally {
    if (!useExistingBrowser) {
      await browser.close();
    }
  }
}

async function extractJobData(
  page: puppeteer.Page,
  htmlPath?: string,
  screenshotPath?: string
): Promise<ScrapedJobPosting> {
  const url = page.url();
  
  // Extract position
  const position = await page.evaluate(() => {
    const title = document.querySelector('h1')?.textContent?.trim();
    return title || 'Unknown Position';
  });

  // Extract employer
  const employer = await page.evaluate(() => {
    const company = document.querySelector('.company-name')?.textContent?.trim() ||
                   document.querySelector('.employer')?.textContent?.trim() ||
                   'Unknown Employer';
    return company;
  });

  // Extract location
  const location = await page.evaluate(() => {
    const loc = document.querySelector('.location')?.textContent?.trim();
    return loc || undefined;
  });

  // Extract description
  const description = await page.evaluate(() => {
    const desc = document.querySelector('.job-description')?.textContent?.trim() ||
                document.querySelector('.description')?.textContent?.trim() ||
                'No description available';
    return desc;
  });

  // Extract responsibilities and qualifications
  const responsibilities = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('.responsibilities li, .duties li'));
    return items.map(item => item.textContent?.trim() || '').filter(Boolean);
  });

  const qualifications = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('.qualifications li, .requirements li'));
    return items.map(item => item.textContent?.trim() || '').filter(Boolean);
  });

  // Extract skills, education, and experience
  const skills = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('.skills li, .competencies li'));
    return items.map(item => item.textContent?.trim() || '').filter(Boolean);
  });

  const education = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('.education li, .requirements li'));
    return items.map(item => item.textContent?.trim() || '').filter(Boolean);
  });

  const experience = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('.experience li, .requirements li'));
    return items.map(item => item.textContent?.trim() || '').filter(Boolean);
  });

  // Extract metadata
  const metadata = await page.evaluate(() => {
    const getText = (selector: string) => {
      const element = document.querySelector(selector);
      return element ? element.textContent?.trim() : undefined;
    };

    const postedDate = getText('.posted-date, [itemprop="datePosted"]');
    const closingDate = getText('.closing-date, .application-deadline');
    const salary = getText('.salary, [itemprop="baseSalary"]');
    const employmentType = getText('.employment-type, [itemprop="employmentType"]');

    if (postedDate || closingDate || salary || employmentType) {
      return {
        postedDate,
        closingDate,
        salary,
        employmentType
      };
    }
    return undefined;
  });

  const result: ScrapedJobPosting = {
    url,
    position,
    employer,
    description,
    htmlPath,
    screenshotPath
  };

  if (location) result.location = location;
  if (responsibilities.length > 0) result.responsibilities = responsibilities;
  if (qualifications.length > 0) result.qualifications = qualifications;
  if (skills.length > 0) result.skills = skills;
  if (education.length > 0) result.education = education;
  if (experience.length > 0) result.experience = experience;
  if (metadata) result.metadata = metadata;

  return result;
}

/**
 * Scrape job posting data from Indeed
 */
export async function scrapeIndeedJob(
  page: puppeteer.Page, 
  url: string,
  htmlPath?: string,
  screenshotPath?: string
): Promise<ScrapedJobPosting> {
  // Extract job title - try multiple selectors
  const title = await page.evaluate(() => {
    const titleSelector = document.querySelector('.jobsearch-JobInfoHeader-title');
    if (titleSelector && titleSelector.textContent) {
      return titleSelector.textContent.trim();
    }
    
    const h1Title = document.querySelector('h1.jobsearch-JobTitle');
    if (h1Title && h1Title.textContent) {
      return h1Title.textContent.trim();
    }
    
    // Fallback to any heading that might contain the title
    const headings = Array.from(document.querySelectorAll('h1, h2'));
    for (const heading of headings) {
      if (heading.textContent && heading.textContent.trim().length > 0) {
        return heading.textContent.trim();
      }
    }
    
    return 'Unknown Position';
  });
  
  // Extract company name
  let company = await page.evaluate(() => {
    const companySelector = document.querySelector('.jobsearch-InlineCompanyRating-companyName');
    if (companySelector && companySelector.textContent) {
      return companySelector.textContent.trim();
    }
    
    const companyLink = document.querySelector('a[data-tn-element="companyName"]');
    if (companyLink && companyLink.textContent) {
      return companyLink.textContent.trim();
    }
    
    return 'Unknown Company';
  });

  // --- Post-process company string for edge cases ---
  if (company.includes('|')) {
    const parts = company.split('|').map(s => s.trim());
    const lastPart = parts[parts.length - 1];
    if (lastPart && lastPart.length > 1) {
      company = lastPart;
    }
  }
  if (company.toLowerCase().includes(' at ')) {
    company = company.split(' at ').pop()?.trim() || company;
  }
  // Extract location
  const location = await page.evaluate(() => {
    const locationSelector = document.querySelector('.jobsearch-JobInfoHeader-subtitle .jobsearch-JobInfoHeader-locationText');
    if (locationSelector && locationSelector.textContent) {
      return locationSelector.textContent.trim();
    }
    
    return undefined;
  });
  
  // Extract job description
  const description = await page.evaluate(() => {
    const descriptionSelector = document.querySelector('#jobDescriptionText');
    if (descriptionSelector && descriptionSelector.textContent) {
      return descriptionSelector.textContent.trim();
    }
    
    return 'No description available';
  });
  
  // Extract responsibilities
  const responsibilities = await page.evaluate(() => {
    const items: string[] = [];
    
    // Look for common responsibility section headers
    const responsibilityHeaders = [
      'Responsibilities',
      'Duties',
      'What You\'ll Do'
    ];
    
    // Try to find sections with these headers
    for (const header of responsibilityHeaders) {
      // Find elements containing the header text
      const elements = Array.from(document.querySelectorAll('div, p, h2, h3, h4'));
      const headerElement = elements.find(el => 
        el.textContent && el.textContent.includes(header)
      );
      
      if (headerElement) {
        // Look for lists after this header
        let nextElement = headerElement.nextElementSibling;
        while (nextElement) {
          if (nextElement.tagName === 'UL' || nextElement.tagName === 'OL') {
            const listItems = Array.from(nextElement.querySelectorAll('li'));
            for (const item of listItems) {
              if (item.textContent) {
                items.push(item.textContent.trim());
              }
            }
            break;
          } else if (nextElement.tagName === 'H2' || nextElement.tagName === 'H3') {
            // Stop if we hit another heading
            break;
          }
          nextElement = nextElement.nextElementSibling;
        }
      }
    }
    
    return items;
  });
  
  // Extract qualifications
  const qualifications = await page.evaluate(() => {
    const items: string[] = [];
    
    // Look for common qualification section headers
    const qualificationHeaders = [
      'Qualifications',
      'Requirements',
      'Skills',
      'What You\'ll Need'
    ];
    
    // Try to find sections with these headers
    for (const header of qualificationHeaders) {
      // Find elements containing the header text
      const elements = Array.from(document.querySelectorAll('div, p, h2, h3, h4'));
      const headerElement = elements.find(el => 
        el.textContent && el.textContent.includes(header)
      );
      
      if (headerElement) {
        // Look for lists after this header
        let nextElement = headerElement.nextElementSibling;
        while (nextElement) {
          if (nextElement.tagName === 'UL' || nextElement.tagName === 'OL') {
            const listItems = Array.from(nextElement.querySelectorAll('li'));
            for (const item of listItems) {
              if (item.textContent) {
                items.push(item.textContent.trim());
              }
            }
            break;
          } else if (nextElement.tagName === 'H2' || nextElement.tagName === 'H3') {
            // Stop if we hit another heading
            break;
          }
          nextElement = nextElement.nextElementSibling;
        }
      }
    }
    
    return items;
  });
  
  const result: Partial<ScrapedJobPosting> = {
    url,
    position: title,
    employer: company,
    description
  };

  if (location) result.location = location;
  if (responsibilities.length > 0) result.responsibilities = responsibilities;
  if (qualifications.length > 0) result.qualifications = qualifications;
  if (htmlPath) result.htmlPath = htmlPath;
  if (screenshotPath) result.screenshotPath = screenshotPath;

  return result as ScrapedJobPosting;
}

/**
 * Scrape job posting data from LinkedIn
 */
export async function scrapeLinkedInJob(
  page: puppeteer.Page, 
  url: string,
  htmlPath?: string,
  screenshotPath?: string
): Promise<ScrapedJobPosting> {
  // Check if we're on a login page
  const isLoginPage = await page.evaluate(() => {
    return document.querySelector('input[name="session_key"]') !== null;
  });
  
  if (isLoginPage) {
    throw new Error('LinkedIn requires login. Please login manually first or provide cookies.');
  }
  
  // Extract job title
  const title = await page.evaluate(() => {
    const titleSelector = document.querySelector('.top-card-layout__title');
    if (titleSelector && titleSelector.textContent) {
      return titleSelector.textContent.trim();
    }
    
    return 'Unknown Position';
  });
  
  // Extract company name
  const company = await page.evaluate(() => {
    const companySelector = document.querySelector('.topcard__org-name-link');
    if (companySelector && companySelector.textContent) {
      return companySelector.textContent.trim();
    }
    
    return 'Unknown Company';
  });
  
  // Extract location
  const location = await page.evaluate(() => {
    const locationSelector = document.querySelector('.topcard__flavor--bullet');
    if (locationSelector && locationSelector.textContent) {
      return locationSelector.textContent.trim();
    }
    
    return undefined;
  });
  
  // Extract job description
  const description = await page.evaluate(() => {
    const descriptionSelector = document.querySelector('.description__text');
    if (descriptionSelector && descriptionSelector.textContent) {
      return descriptionSelector.textContent.trim();
    }
    
    return 'No description available';
  });
  
  // Extract responsibilities and qualifications
  const { responsibilities, qualifications } = await page.evaluate(() => {
    const responsibilitiesArray: string[] = [];
    const qualificationsArray: string[] = [];
    
    // Look for sections
    const sections = document.querySelectorAll('.description__text > section');
    
    sections.forEach(section => {
      const heading = section.querySelector('h3, h2');
      if (!heading || !heading.textContent) return;
      
      const headingText = heading.textContent.toLowerCase();
      const listItems = Array.from(section.querySelectorAll('li'))
        .map(li => li.textContent?.trim())
        .filter(Boolean) as string[];
      
      if (headingText.includes('responsib') || 
          headingText.includes('duties') || 
          headingText.includes('what you\'ll do')) {
        responsibilitiesArray.push(...listItems);
      } else if (headingText.includes('qualif') || 
                 headingText.includes('require') || 
                 headingText.includes('skills') || 
                 headingText.includes('what you need')) {
        qualificationsArray.push(...listItems);
      }
    });
    
    return { 
      responsibilities: responsibilitiesArray, 
      qualifications: qualificationsArray 
    };
  });
  
  const result: Partial<ScrapedJobPosting> = {
    url,
    position: title,
    employer: company,
    description
  };

  if (location) result.location = location;
  if (responsibilities.length > 0) result.responsibilities = responsibilities;
  if (qualifications.length > 0) result.qualifications = qualifications;
  if (htmlPath) result.htmlPath = htmlPath;
  if (screenshotPath) result.screenshotPath = screenshotPath;

  return result as ScrapedJobPosting;
}

/**
 * Scrape job posting data from a generic job site
 */
export async function scrapeGenericJob(
  page: puppeteer.Page, 
  url: string,
  htmlPath?: string,
  screenshotPath?: string
): Promise<ScrapedJobPosting> {
  // Extract job title - look for common patterns
  const title = await page.evaluate(() => {
    // Try meta tags first
    const metaTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
                      document.querySelector('meta[name="twitter:title"]')?.getAttribute('content');
    
    if (metaTitle) return metaTitle;
    
    // Try H1
    const h1 = document.querySelector('h1');
    if (h1 && h1.textContent) {
      return h1.textContent.trim();
    }
    
    // Try common job title class names
    const titleSelectors = [
      '.job-title', '.jobtitle', '.position-title', '.posting-title',
      '[data-testid="job-title"]', '[itemprop="title"]'
    ];
    
    for (const selector of titleSelectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent) {
        return el.textContent.trim();
      }
    }
    
    // Fallback to page title
    return document.title.replace(/\s*\|.*$/, '').trim() || 'Unknown Position';
  });
  
  // Extract company name
  const company = await page.evaluate(() => {
    // Try meta tags first
    const metaCompany = document.querySelector('meta[property="og:site_name"]')?.getAttribute('content');
    if (metaCompany) return metaCompany;
    
    // Try common company name selectors
    const companySelectors = [
      '.company-name', '.employer', '.org', '[itemprop="hiringOrganization"]',
      '[data-testid="company-name"]'
    ];
    
    for (const selector of companySelectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent) {
        return el.textContent.trim();
      }
    }
    
    return 'Unknown Company';
  });
  
  // Extract location
  const location = await page.evaluate(() => {
    const locationSelectors = [
      '.location', '.job-location', '[itemprop="jobLocation"]',
      '[data-testid="location"]'
    ];
    
    for (const selector of locationSelectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent) {
        return el.textContent.trim();
      }
    }
    
    return undefined;
  });
  
  // Extract job description
  const description = await page.evaluate(() => {
    const descriptionSelectors = [
      '.job-description', '#job-description', '[itemprop="description"]',
      '[data-testid="description"]', '.description'
    ];
    
    for (const selector of descriptionSelectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent) {
        return el.textContent.trim();
      }
    }
    
    // If no dedicated description element, try to get the main content
    const mainContent = document.querySelector('main, #main, .main, #content, .content, article');
    if (mainContent && mainContent.textContent) {
      return mainContent.textContent.trim();
    }
    
    return 'No description available';
  });
  
  // Generic lists extraction for responsibilities and qualifications
  const { responsibilities, qualifications } = await page.evaluate(() => {
    const responsibilitiesArray: string[] = [];
    const qualificationsArray: string[] = [];
    
    // Look for common section headings
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, strong, b');
    
    for (const heading of headings) {
      if (!heading.textContent) continue;
      
      const headingText = heading.textContent.toLowerCase();
      
      // Look for lists after each heading
      let sibling = heading.nextElementSibling;
      let items: string[] = [];
      
      // Collect list items until next heading
      while (sibling && !['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(sibling.tagName)) {
        if (sibling.tagName === 'UL' || sibling.tagName === 'OL') {
          const listItems = Array.from(sibling.querySelectorAll('li'))
            .map(li => li.textContent?.trim())
            .filter(Boolean) as string[];
          
          items.push(...listItems);
        }
        sibling = sibling.nextElementSibling;
      }
      
      // Categorize based on heading text
      if (items.length > 0) {
        if (headingText.includes('responsib') || 
            headingText.includes('duties') || 
            headingText.includes('what you do') ||
            headingText.includes('day to day')) {
          responsibilitiesArray.push(...items);
        } else if (headingText.includes('qualif') || 
                  headingText.includes('require') || 
                  headingText.includes('skills') ||
                  headingText.includes('what you need') ||
                  headingText.includes('experience') ||
                  headingText.includes('background')) {
          qualificationsArray.push(...items);
        }
      }
    }
    
    return { 
      responsibilities: responsibilitiesArray, 
      qualifications: qualificationsArray 
    };
  });
  
  const result: Partial<ScrapedJobPosting> = {
    url,
    position: title,
    employer: company,
    description
  };

  if (location) result.location = location;
  if (responsibilities.length > 0) result.responsibilities = responsibilities;
  if (qualifications.length > 0) result.qualifications = qualifications;
  if (htmlPath) result.htmlPath = htmlPath;
  if (screenshotPath) result.screenshotPath = screenshotPath;

  return result as ScrapedJobPosting;
}

/**
 * Detect if a page contains a CAPTCHA or verification challenge
 * 
 * @param page The Puppeteer page to check
 * @returns True if a CAPTCHA or verification page is detected
 */
async function detectCaptcha(page: puppeteer.Page): Promise<boolean> {
  // Get the page title
  const title = await page.title();
  
  // Check if the title contains verification keywords
  if (title.includes('Verification') || 
      title.includes('Security Check') || 
      title.includes('CAPTCHA') || 
      title.includes('Robot') ||
      title.includes('Additional Verification Required')) {
    return true;
  }
  
  // Check for common CAPTCHA providers and verification elements
  const hasCaptchaElements = await page.evaluate(() => {
    const captchaSelectors = [
      // reCAPTCHA
      '.g-recaptcha',
      'iframe[src*="recaptcha"]',
      // hCaptcha 
      '.h-captcha',
      'iframe[src*="hcaptcha"]',
      // Cloudflare
      '#challenge-form',
      // Common verification text and forms
      '#captcha',
      '.captcha',
      '[id*="captcha"]',
      '[class*="captcha"]',
      '.verification',
      '#verification',
      // Indeed specific
      '.turnstile_challenge',
      '#indeed-challenge'
    ];
    
    for (const selector of captchaSelectors) {
      if (document.querySelector(selector)) {
        return true;
      }
    }
    
    // Check for common verification text
    const bodyText = document.body.innerText.toLowerCase();
    const verificationPhrases = [
      'verify you are human',
      'prove you\'re human',
      'security check',
      'complete the captcha',
      'complete security check',
      'verification required',
      'additional verification',
      'robot check'
    ];
    
    for (const phrase of verificationPhrases) {
      if (bodyText.includes(phrase)) {
        return true;
      }
    }
    
    return false;
  });
  
  return hasCaptchaElements;
}

/**
 * Generate a filename from a URL
 */
function generateFilename(url: string): string {
  // Extract domain and path
  const parsedUrl = new URL(url);
  const domain = parsedUrl.hostname.replace('www.', '');
  
  // Remove protocol and special characters, limit length
  const sanitizedPath = parsedUrl.pathname
    .replace(/\//g, '-')
    .replace(/[^a-zA-Z0-9-_]/g, '')
    .substring(0, 50);
  
  // Add date for uniqueness
  const date = new Date().toISOString().split('T')[0];
  
  return `${domain}${sanitizedPath}-${date}`;
}