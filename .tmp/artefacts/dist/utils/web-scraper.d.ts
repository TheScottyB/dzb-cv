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
export declare function scrapeJobPosting(url: string, options?: ScraperOptions): Promise<ScrapedJobPosting>;
