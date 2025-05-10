import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
/**
 * Default scraper options
 */
const DEFAULT_SCRAPER_OPTIONS = {
  headless: true,
  waitTime: 5000,
  outputDir: 'output/scraped',
  saveHtml: true,
  saveScreenshot: true,
  savePdf: false,
  viewport: {
    width: 1920,
    height: 1080,
  },
  // Latest Chrome user agent string with current version
  customUserAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  // By default, don't use existing browser
  useExistingBrowser: false,
  // Default Chrome DevTools Protocol URL (when Chrome is started with --remote-debugging-port=9222)
  cdpUrl: 'http://localhost:9222',
};
/**
 * Scrape a job posting from Indeed or LinkedIn using Puppeteer
 *
 * @param url The URL of the job posting to scrape
 * @param options Scraping options
 * @returns Scraped job posting data
 */
export async function scrapeJobPosting(url, options = {}) {
  // Merge options with defaults
  const mergedOptions = { ...DEFAULT_SCRAPER_OPTIONS, ...options };
  // Create output directory if it doesn't exist
  if (mergedOptions.outputDir) {
    await fs.mkdir(mergedOptions.outputDir, { recursive: true });
  }
  // Generate a filename based on the URL
  const filename = generateFilename(url);
  // Initialize browser - either connect to existing instance or launch new one
  let browser;
  if (mergedOptions.useExistingBrowser) {
    try {
      console.log(`Connecting to existing Chrome instance at ${mergedOptions.cdpUrl}...`);
      // Connect to the browser instance
      browser = await puppeteer.connect({
        browserURL: mergedOptions.cdpUrl,
        defaultViewport: mergedOptions.viewport,
      });
      console.log('Successfully connected to existing Chrome instance.');
    } catch (error) {
      throw new Error(
        `Failed to connect to existing Chrome instance: ${error instanceof Error ? error.message : String(error)}\n` +
          `Make sure Chrome is running with the remote debugging port enabled.\n` +
          `You can start Chrome with: chrome --remote-debugging-port=9222`
      );
    }
  } else {
    // Launch a new browser
    browser = await puppeteer.launch({
      headless: mergedOptions.headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
      ],
    });
  }
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
    await new Promise((resolve) => setTimeout(resolve, mergedOptions.waitTime || 5000));
    // Get page title
    const title = await page.title();
    // Save HTML if requested
    let htmlPath;
    if (mergedOptions.saveHtml && mergedOptions.outputDir) {
      const html = await page.content();
      htmlPath = path.join(mergedOptions.outputDir, `${filename}.html`);
      await fs.writeFile(htmlPath, html, 'utf-8');
    }
    // Save screenshot if requested
    let screenshotPath;
    if (mergedOptions.saveScreenshot && mergedOptions.outputDir) {
      screenshotPath = path.join(mergedOptions.outputDir, `${filename}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
    }
    // Save PDF if requested
    let pdfPath;
    if (mergedOptions.savePdf && mergedOptions.outputDir) {
      pdfPath = path.join(mergedOptions.outputDir, `${filename}.pdf`);
      await page.pdf({ path: pdfPath, format: 'A4' });
    }
    // Check for CAPTCHA or verification page
    const hasCaptcha = await detectCaptcha(page);
    // If CAPTCHA is detected and we're in headless mode, we need to handle it
    if (hasCaptcha && mergedOptions.headless) {
      console.log('\nCAPTCHA or verification page detected!');
      // Create a screenshot of the CAPTCHA page
      if (mergedOptions.outputDir) {
        const captchaScreenshotPath = path.join(mergedOptions.outputDir, `captcha-${filename}.png`);
        await page.screenshot({ path: captchaScreenshotPath, fullPage: true });
        console.log(`CAPTCHA screenshot saved to: ${captchaScreenshotPath}`);
      }
      // Close the headless browser or disconnect if using existing browser
      if (mergedOptions.useExistingBrowser) {
        await browser.disconnect();
      } else {
        await browser.close();
      }
      // Notify about switching to visible mode for manual CAPTCHA solving
      console.log('Switching to visible browser mode for manual CAPTCHA solving...');
      // Relaunch with visible browser
      const visibleBrowser = await puppeteer.launch({
        headless: false, // Show the browser
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process',
          '--window-size=1280,960',
        ],
      });
      // Create a new page
      const visiblePage = await visibleBrowser.newPage();
      // Set the same user agent and viewport
      if (mergedOptions.customUserAgent) {
        await visiblePage.setUserAgent(mergedOptions.customUserAgent);
      }
      if (mergedOptions.viewport) {
        await visiblePage.setViewport(mergedOptions.viewport);
      }
      // Navigate to the URL
      await visiblePage.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      // Prompt the user to solve the CAPTCHA
      console.log('\nPlease solve the CAPTCHA in the browser window.');
      console.log(
        'Once you have solved the CAPTCHA and can see the job details, press Enter to continue...'
      );
      // Wait for user to press Enter (this requires user interaction)
      // Using process.stdin here as a quick solution
      // For a real CLI tool, we would use inquirer or similar
      await new Promise((resolve) => {
        process.stdin.once('data', () => {
          resolve();
        });
      });
      console.log('Continuing with scraping after CAPTCHA resolution...');
      // Wait for content to fully load
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // Save updated HTML if requested
      if (mergedOptions.saveHtml && mergedOptions.outputDir) {
        const html = await visiblePage.content();
        htmlPath = path.join(mergedOptions.outputDir, `${filename}.html`);
        await fs.writeFile(htmlPath, html, 'utf-8');
      }
      // Save updated screenshot if requested
      if (mergedOptions.saveScreenshot && mergedOptions.outputDir) {
        screenshotPath = path.join(mergedOptions.outputDir, `${filename}.png`);
        await visiblePage.screenshot({ path: screenshotPath, fullPage: true });
      }
      // Extract job data based on the site
      let jobData;
      if (url.includes('indeed.com')) {
        jobData = await scrapeIndeedJob(visiblePage, url, htmlPath, screenshotPath);
      } else if (url.includes('linkedin.com')) {
        jobData = await scrapeLinkedInJob(visiblePage, url, htmlPath, screenshotPath);
      } else {
        // Generic job scraping
        jobData = await scrapeGenericJob(visiblePage, url, htmlPath, screenshotPath);
      }
      // Close browser
      await visibleBrowser.close();
      return jobData;
    } else {
      // No CAPTCHA or already in visible mode, proceed normally
      // Extract job data based on the site
      let jobData;
      if (url.includes('indeed.com')) {
        jobData = await scrapeIndeedJob(page, url, htmlPath, screenshotPath);
      } else if (url.includes('linkedin.com')) {
        jobData = await scrapeLinkedInJob(page, url, htmlPath, screenshotPath);
      } else {
        // Generic job scraping
        jobData = await scrapeGenericJob(page, url, htmlPath, screenshotPath);
      }
      // Close browser or disconnect if using existing browser
      if (mergedOptions.useExistingBrowser) {
        await browser.disconnect();
      } else {
        await browser.close();
      }
      return jobData;
    }
  } catch (error) {
    // Close browser or disconnect if using existing browser
    try {
      if (mergedOptions.useExistingBrowser) {
        await browser.disconnect();
      } else {
        await browser.close();
      }
    } catch (closeError) {
      // Ignore any errors during browser closing/disconnection
      console.error('Error during browser cleanup:', closeError);
    }
    throw new Error(
      `Failed to scrape job posting: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
/**
 * Scrape job posting data from Indeed
 */
async function scrapeIndeedJob(page, url, htmlPath, screenshotPath) {
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
    const parts = company.split('|').map((s) => s.trim());
    if (parts[parts.length - 1] && parts[parts.length - 1].length > 1) {
      company = parts[parts.length - 1];
    }
  }
  if (company.toLowerCase().includes(' at ')) {
    company = company.split(' at ').pop()?.trim() || company;
  }
  // Extract location
  const location = await page.evaluate(() => {
    const locationSelector = document.querySelector(
      '.jobsearch-JobInfoHeader-subtitle .jobsearch-JobInfoHeader-locationText'
    );
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
    const items = [];
    // Look for common responsibility section headers
    const responsibilityHeaders = ['Responsibilities', 'Duties', "What You'll Do"];
    // Try to find sections with these headers
    for (const header of responsibilityHeaders) {
      // Find elements containing the header text
      const elements = Array.from(document.querySelectorAll('div, p, h2, h3, h4'));
      const headerElement = elements.find(
        (el) => el.textContent && el.textContent.includes(header)
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
    const items = [];
    // Look for common qualification section headers
    const qualificationHeaders = ['Qualifications', 'Requirements', 'Skills', "What You'll Need"];
    // Try to find sections with these headers
    for (const header of qualificationHeaders) {
      // Find elements containing the header text
      const elements = Array.from(document.querySelectorAll('div, p, h2, h3, h4'));
      const headerElement = elements.find(
        (el) => el.textContent && el.textContent.includes(header)
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
    screenshotPath,
  };
}
/**
 * Scrape job posting data from LinkedIn
 */
async function scrapeLinkedInJob(page, url, htmlPath, screenshotPath) {
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
    const responsibilitiesArray = [];
    const qualificationsArray = [];
    // Look for sections
    const sections = document.querySelectorAll('.description__text > section');
    sections.forEach((section) => {
      const heading = section.querySelector('h3, h2');
      if (!heading || !heading.textContent) return;
      const headingText = heading.textContent.toLowerCase();
      const listItems = Array.from(section.querySelectorAll('li'))
        .map((li) => li.textContent?.trim())
        .filter(Boolean);
      if (
        headingText.includes('responsib') ||
        headingText.includes('duties') ||
        headingText.includes("what you'll do")
      ) {
        responsibilitiesArray.push(...listItems);
      } else if (
        headingText.includes('qualif') ||
        headingText.includes('require') ||
        headingText.includes('skills') ||
        headingText.includes('what you need')
      ) {
        qualificationsArray.push(...listItems);
      }
    });
    return {
      responsibilities: responsibilitiesArray,
      qualifications: qualificationsArray,
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
    screenshotPath,
  };
}
/**
 * Scrape job posting data from a generic job site
 */
async function scrapeGenericJob(page, url, htmlPath, screenshotPath) {
  // Extract job title - look for common patterns
  const title = await page.evaluate(() => {
    // Try meta tags first
    const metaTitle =
      document.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
      document.querySelector('meta[name="twitter:title"]')?.getAttribute('content');
    if (metaTitle) return metaTitle;
    // Try H1
    const h1 = document.querySelector('h1');
    if (h1 && h1.textContent) {
      return h1.textContent.trim();
    }
    // Try common job title class names
    const titleSelectors = [
      '.job-title',
      '.jobtitle',
      '.position-title',
      '.posting-title',
      '[data-testid="job-title"]',
      '[itemprop="title"]',
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
    const metaCompany = document
      .querySelector('meta[property="og:site_name"]')
      ?.getAttribute('content');
    if (metaCompany) return metaCompany;
    // Try common company name selectors
    const companySelectors = [
      '.company-name',
      '.employer',
      '.org',
      '[itemprop="hiringOrganization"]',
      '[data-testid="company-name"]',
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
      '.location',
      '.job-location',
      '[itemprop="jobLocation"]',
      '[data-testid="location"]',
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
      '.job-description',
      '#job-description',
      '[itemprop="description"]',
      '[data-testid="description"]',
      '.description',
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
    const responsibilitiesArray = [];
    const qualificationsArray = [];
    // Look for common section headings
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, strong, b');
    for (const heading of headings) {
      if (!heading.textContent) continue;
      const headingText = heading.textContent.toLowerCase();
      // Look for lists after each heading
      let sibling = heading.nextElementSibling;
      const items = [];
      // Collect list items until next heading
      while (sibling && !['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(sibling.tagName)) {
        if (sibling.tagName === 'UL' || sibling.tagName === 'OL') {
          const listItems = Array.from(sibling.querySelectorAll('li'))
            .map((li) => li.textContent?.trim())
            .filter(Boolean);
          items.push(...listItems);
        }
        sibling = sibling.nextElementSibling;
      }
      // Categorize based on heading text
      if (items.length > 0) {
        if (
          headingText.includes('responsib') ||
          headingText.includes('duties') ||
          headingText.includes('what you do') ||
          headingText.includes('day to day')
        ) {
          responsibilitiesArray.push(...items);
        } else if (
          headingText.includes('qualif') ||
          headingText.includes('require') ||
          headingText.includes('skills') ||
          headingText.includes('what you need') ||
          headingText.includes('experience') ||
          headingText.includes('background')
        ) {
          qualificationsArray.push(...items);
        }
      }
    }
    return {
      responsibilities: responsibilitiesArray,
      qualifications: qualificationsArray,
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
    screenshotPath,
  };
}
/**
 * Detect if a page contains a CAPTCHA or verification challenge
 *
 * @param page The Puppeteer page to check
 * @returns True if a CAPTCHA or verification page is detected
 */
async function detectCaptcha(page) {
  // Get the page title
  const _title = await page.title();
  // Check if the title contains verification keywords
  if (
    title.includes('Verification') ||
    title.includes('Security Check') ||
    title.includes('CAPTCHA') ||
    title.includes('Robot') ||
    title.includes('Additional Verification Required')
  ) {
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
      '#indeed-challenge',
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
      "prove you're human",
      'security check',
      'complete the captcha',
      'complete security check',
      'verification required',
      'additional verification',
      'robot check',
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
function generateFilename(url) {
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
//# sourceMappingURL=web-scraper.js.map
