import fs from 'fs/promises';
import path from 'path';
import { URL } from 'url';
import { fileURLToPath } from 'url';

interface JobScraperOptions {
  outputBaseDir?: string;
  createTimestamp?: boolean;
  userAgent?: string;
}

/**
 * Error class for authentication required errors
 */
class AuthenticationRequiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationRequiredError';
  }
}

/**
 * Validates that a URL is well-formed and uses HTTP/HTTPS
 */
function validateUrl(url: string): void {
  try {
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('URL must use HTTP or HTTPS protocol');
    }
  } catch (error) {
    throw new Error(`Invalid URL: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Extracts company name and job ID from URL
 */
function extractJobInfo(url: string): { company: string; jobId: string } {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const pathname = urlObj.pathname;
    
    // Extract company name from hostname
    let company = hostname.split('.')[1] || hostname.split('.')[0];
    company = company.replace(/^www\./, '');
    
    // Extract job ID from pathname
    const jobIdMatch = pathname.match(/\/(\d+)(?:[/?]|$)/);
    const jobId = jobIdMatch ? jobIdMatch[1] : Date.now().toString();
    
    return { company, jobId };
  } catch (error) {
    console.warn('Failed to parse URL, using fallback values:', error);
    return { company: 'unknown', jobId: Date.now().toString() };
  }
}

/**
 * Creates output directory path
 */
function createOutputPath(url: string, options: JobScraperOptions): string {
  const { company, jobId } = extractJobInfo(url);
  const baseDir = options.outputBaseDir || 'job-postings';
  const timestamp = options.createTimestamp ? `-${Date.now()}` : '';
  
  return path.join(baseDir, `${company}-${jobId}${timestamp}`);
}

/**
 * Checks if the page requires authentication
 */
function requiresAuthentication(html: string): boolean {
  const loginIndicators = [
    'Sign in',
    'Log in',
    'Please login',
    'Please sign in',
    'Authentication required',
    'class="login-form"',
    'id="login"',
    'name="login"'
  ];

  const lowerHtml = html.toLowerCase();
  return loginIndicators.some(indicator => 
    lowerHtml.includes(indicator.toLowerCase())
  );
}

/**
 * Extracts basic job information from HTML content
 */
function extractJobInfoFromHtml(html: string): {
  title: string;
  company: string;
  location?: string;
  description: string;
} {
  // Check for authentication requirement first
  if (requiresAuthentication(html)) {
    throw new AuthenticationRequiredError('This job posting requires authentication to view');
  }

  // Create a DOMParser-like environment using regex
  const cleanHtml = (text: string) => {
    return text
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove style tags and content
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove script tags and content
      .replace(/<[^>]+>/g, ' ') // Replace remaining HTML tags with space
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
      .replace(/&[a-z]+;/gi, '') // Remove other HTML entities
      .trim();
  };

  // Extract title - try multiple common patterns
  let title = '';
  const titlePatterns = [
    /<title>(.*?)<\/title>/i,
    /<h1[^>]*>(.*?)<\/h1>/i,
    /<div[^>]*class="[^"]*job-title[^"]*"[^>]*>(.*?)<\/div>/i,
    /<div[^>]*class="[^"]*position[^"]*"[^>]*>(.*?)<\/div>/i
  ];
  
  for (const pattern of titlePatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      title = cleanHtml(match[1]);
      break;
    }
  }
  title = title || 'Unknown Position';

  // Extract company name
  let company = '';
  const companyPatterns = [
    /<meta[^>]*property="og:site_name"[^>]*content="([^"]*)"/i,
    /<meta[^>]*name="author"[^>]*content="([^"]*)"/i,
    /<div[^>]*class="[^"]*company[^"]*"[^>]*>(.*?)<\/div>/i,
    /<div[^>]*class="[^"]*company-name[^"]*"[^>]*>(.*?)<\/div>/i,
    /<div[^>]*class="[^"]*employer[^"]*"[^>]*>(.*?)<\/div>/i
  ];
  
  for (const pattern of companyPatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      company = cleanHtml(match[1]);
      break;
    }
  }
  company = company || 'Unknown Company';

  // Extract location
  let location: string | undefined;
  const locationPatterns = [
    /<div[^>]*class="[^"]*location[^"]*"[^>]*>(.*?)<\/div>/i,
    /<span[^>]*class="[^"]*location[^"]*"[^>]*>(.*?)<\/span>/i,
    /<meta[^>]*name="job-location"[^>]*content="([^"]*)"/i
  ];
  
  for (const pattern of locationPatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      location = cleanHtml(match[1]);
      break;
    }
  }

  // Extract description - look for common job description containers
  let description = '';
  const descriptionPatterns = [
    /<div[^>]*class="[^"]*job-description[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*id="job-description"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i
  ];
  
  for (const pattern of descriptionPatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      description = cleanHtml(match[1]);
      if (description.length > 100) { // Only use if we got substantial content
        break;
      }
    }
  }
  
  // If we couldn't find a good description container, fall back to a more general approach
  if (!description) {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      description = cleanHtml(bodyMatch[1]);
    } else {
      description = cleanHtml(html);
    }
  }

  return {
    title,
    company,
    location,
    description
  };
}

/**
 * Scrapes a job posting and saves the results
 */
async function scrapeJob(url: string, options: Partial<JobScraperOptions> = {}) {
  // Validate URL before proceeding
  validateUrl(url);
  
  const outputDir = createOutputPath(url, options as JobScraperOptions);
  
  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  try {
    console.log(`Scraping job posting from: ${url}`);
    console.log(`Results will be saved to: ${outputDir}`);
    
    // Make HTTP request
    const response = await fetch(url, {
      headers: {
        'User-Agent': options.userAgent || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    
    // Save HTML
    const htmlPath = path.join(outputDir, 'job.html');
    await fs.writeFile(htmlPath, html, 'utf-8');
    
    try {
      // Extract job data
      const jobData = {
        url,
        ...extractJobInfoFromHtml(html),
        htmlPath
      };
      
      // Save the extracted data as JSON
      const jsonPath = path.join(outputDir, 'job-data.json');
      await fs.writeFile(jsonPath, JSON.stringify(jobData, null, 2), 'utf-8');
      
      console.log('Job posting scraped successfully');
      console.log(`Job Title: ${jobData.title}`);
      console.log(`Company: ${jobData.company}`);
      console.log(`Location: ${jobData.location || 'Not specified'}`);
      console.log(`Data saved to: ${jsonPath}`);
      
      return {
        jobData,
        outputDir,
        jsonPath
      };
    } catch (error) {
      if (error instanceof AuthenticationRequiredError) {
        console.error('Authentication required:', error.message);
        console.error('This job posting requires you to be logged in to view it.');
        console.error('Try accessing the URL directly in your browser while logged in.');
      }
      throw error;
    }
  } catch (error) {
    console.error('Failed to scrape job posting:', error);
    throw error;
  }
}

// Command line interface
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  const url = process.argv[2];
  if (!url) {
    console.error('Please provide a job posting URL as an argument');
    process.exit(1);
  }

  scrapeJob(url, {
    createTimestamp: true
  }).catch(error => {
    console.error('Script execution failed:', error);
    process.exit(1);
  });
}

export { scrapeJob, JobScraperOptions, AuthenticationRequiredError }; 