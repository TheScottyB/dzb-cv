import type { JobPosting } from './posting.js';

/**
 * Options for job posting scraper
 * @interface ScraperOptions
 */
export interface ScraperOptions {
  /** Run in headless mode */
  headless?: boolean;
  /** Wait time in milliseconds */
  waitTime?: number;
  /** Output directory for saved files */
  outputDir?: string;
  /** Save HTML content */
  saveHtml?: boolean;
  /** Save page screenshot */
  saveScreenshot?: boolean;
  /** Save as PDF */
  savePdf?: boolean;
  /** Custom user agent string */
  customUserAgent?: string;
}

/**
 * Result of scraping a job posting
 * @interface ScraperResult
 */
export interface ScraperResult {
  /** Whether scraping was successful */
  success: boolean;
  /** Scraped job posting data */
  data?: JobPosting;
  /** Error message if scraping failed */
  error?: string;
  /** Scraping metadata */
  metadata: {
    /** Timestamp of scraping */
    timestamp: string;
    /** Duration of scraping operation */
    duration: number;
    /** URL that was scraped */
    url: string;
  };
  /** Paths to saved files */
  files?: {
    /** Path to saved HTML file */
    htmlPath?: string;
    /** Path to saved screenshot */
    screenshotPath?: string;
    /** Path to saved PDF */
    pdfPath?: string;
  };
}

