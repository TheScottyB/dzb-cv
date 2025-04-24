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
    width: 1280,
    height: 800
  },
  customUserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
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
  title: string;
  company: string;
  location?: string;
  description: string;
  qualifications?: string[];
  responsibilities?: string[];
  htmlPath?: string;
  screenshotPath?: string;
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
  // Merge options with defaults
  const mergedOptions = { ...DEFAULT_SCRAPER_OPTIONS, ...options };
  
  // Create output directory if it doesn't exist
  if (mergedOptions.outputDir) {
    await fs.mkdir(mergedOptions.outputDir, { recursive: true });
  }
  
  // Generate a filename based on the URL
  const filename = generateFilename(url);
  
  // Initialize browser
  const browser = await puppeteer.launch({
    headless: mergedOptions.headless,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport
    if (mergedOptions.viewport) {
      await page.setViewport(mergedOptions.viewport);
    }
    
    // Set user agent
    if (mergedOptions.customUserAgent) {
      await page.setUserAgent(mergedOptions.customUserAgent);
    }
    
    // Set cookies if provided
    if (mergedOptions.cookies && mergedOptions.cookies.length > 0) {
      await page.setCookie(...mergedOptions.cookies);
    }
    
    // Navigate to the URL
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, mergedOptions.waitTime || 5000));
    
    // Get page title
    const title = await page.title();
    
    // Save HTML if requested
    let htmlPath: string | undefined;
    if (mergedOptions.saveHtml && mergedOptions.outputDir) {
      const html = await page.content();
      htmlPath = path.join(mergedOptions.outputDir, `${filename}.html`);
      await fs.writeFile(htmlPath, html, 'utf-8');
    }
    
    // Save screenshot if requested
    let screenshotPath: string | undefined;
    if (mergedOptions.saveScreenshot && mergedOptions.outputDir) {
      screenshotPath = path.join(mergedOptions.outputDir, `${filename}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
    }
    
    // Save PDF if requested
    let pdfPath: string | undefined;
    if (mergedOptions.savePdf && mergedOptions.outputDir) {
      pdfPath = path.join(mergedOptions.outputDir, `${filename}.pdf`);
      await page.pdf({ path: pdfPath, format: 'A4' });
    }
    
    // Extract job data based on the site
    let jobData: ScrapedJobPosting;
    
    if (url.includes('indeed.com')) {
      jobData = await scrapeIndeedJob(page, url, htmlPath, screenshotPath);
    } else if (url.includes('linkedin.com')) {
      jobData = await scrapeLinkedInJob(page, url, htmlPath, screenshotPath);
    } else {
      // Generic job scraping
      jobData = await scrapeGenericJob(page, url, htmlPath, screenshotPath);
    }
    
    // Close browser
    await browser.close();
    
    return jobData;
    
  } catch (error) {
    // Close browser on error
    await browser.close();
    
    throw new Error(`Failed to scrape job posting: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Scrape job posting data from Indeed
 */
async function scrapeIndeedJob(
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
  const company = await page.evaluate(() => {
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
  
  return {
    url,
    title,
    company,
    location,
    description,
    responsibilities,
    qualifications,
    htmlPath,
    screenshotPath
  };
}

/**
 * Scrape job posting data from LinkedIn
 */
async function scrapeLinkedInJob(
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
  
  return {
    url,
    title,
    company,
    location,
    description,
    responsibilities,
    qualifications,
    htmlPath,
    screenshotPath
  };
}

/**
 * Scrape job posting data from a generic job site
 */
async function scrapeGenericJob(
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
  
  return {
    url,
    title,
    company,
    location,
    description,
    responsibilities,
    qualifications,
    htmlPath,
    screenshotPath
  };
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