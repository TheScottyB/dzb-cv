import { scrapeJobPosting, ScraperOptions } from './web-scraper.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Scrapes the Mercy Health job posting and saves the results
 */
async function scrapeMercyPosting() {
  const targetUrl = 'https://careers.mercyhealthsystem.org/jobs/37949?lang=en-us';
  const outputDir = 'job-postings/mercy-health-37949';
  
  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });
  
  const options: ScraperOptions = {
    headless: false, // Set to false to handle any potential CAPTCHA/verification
    waitTime: 5000,
    outputDir: outputDir,
    saveHtml: true,
    saveScreenshot: true,
    savePdf: true,
    customUserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  };

  try {
    console.log(`Scraping job posting from: ${targetUrl}`);
    console.log(`Results will be saved to: ${outputDir}`);
    
    const jobData = await scrapeJobPosting(targetUrl, options);
    
    // Save the extracted data as JSON for further processing
    const jsonPath = path.join(outputDir, 'job-data.json');
    await fs.writeFile(jsonPath, JSON.stringify(jobData, null, 2), 'utf-8');
    
    console.log('Job posting scraped successfully');
    console.log(`Job Title: ${jobData.title}`);
    console.log(`Company: ${jobData.company}`);
    console.log(`Location: ${jobData.location || 'Not specified'}`);
    console.log(`Data saved to: ${jsonPath}`);
    
    return jobData;
  } catch (error) {
    console.error('Failed to scrape job posting:', error);
    throw error;
  }
}

// Run the scraper
scrapeMercyPosting().catch(error => {
  console.error('Script execution failed:', error);
  process.exit(1);
});

