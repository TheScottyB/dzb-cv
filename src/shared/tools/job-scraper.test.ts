import { jest, describe, it, expect, afterEach, beforeEach } from '@jest/globals';
import { scrapeJob } from './job-scraper.js';
import fs from 'fs/promises';
import path from 'path';

// Mock fetch
const mockFetch = jest.fn().mockImplementation((url) => {
  return Promise.resolve({
    ok: true,
    text: () => Promise.resolve(`
      <html>
        <head>
          <title>Mock Job Title</title>
          <meta property="og:site_name" content="Mock Company">
          <meta property="og:description" content="Mock Location">
          <meta name="description" content="Mock job description">
        </head>
        <body>
          <h1>Mock Job Title</h1>
          <div class="company">Mock Company</div>
          <div class="location">Mock Location</div>
          <div class="description">Mock job description</div>
        </body>
      </html>
    `)
  });
});

// @ts-ignore - We're mocking the global fetch
global.fetch = mockFetch;

describe('Job Scraper', () => {
  const testUrl = 'https://example.com/jobs/12345';
  const testOutputDir = 'test-output';

  beforeEach(() => {
    // Clear mock data before each test
    jest.clearAllMocks();
  });

  afterEach(async () => {
    // Clean up test output directory
    try {
      await fs.rm(testOutputDir, { recursive: true, force: true });
    } catch (error) {
      console.warn('Failed to clean up test directory:', error);
    }
  });

  it('should create output directory and save files', async () => {
    const result = await scrapeJob(testUrl, {
      outputBaseDir: testOutputDir
    });

    // Check if output directory exists
    const dirExists = await fs.access(result.outputDir)
      .then(() => true)
      .catch(() => false);
    expect(dirExists).toBe(true);

    // Check if HTML file exists
    const htmlExists = await fs.access(path.join(result.outputDir, 'job.html'))
      .then(() => true)
      .catch(() => false);
    expect(htmlExists).toBe(true);

    // Check if JSON file exists
    const jsonExists = await fs.access(result.jsonPath)
      .then(() => true)
      .catch(() => false);
    expect(jsonExists).toBe(true);

    // Check if job data has required fields
    expect(result.jobData).toHaveProperty('position', 'Mock Job Title');
    expect(result.jobData).toHaveProperty('employer', 'Mock Company');
    expect(result.jobData).toHaveProperty('location', 'Mock Location');
    expect(result.jobData).toHaveProperty('description');
    expect(result.jobData).toHaveProperty('htmlPath');
  });

  it('should handle invalid URLs gracefully', async () => {
    const invalidUrl = 'not-a-url';
    await expect(scrapeJob(invalidUrl)).rejects.toThrow();
  });

  it('should handle HTTP errors', async () => {
    // Mock fetch to return an error
    mockFetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 404
      })
    );

    await expect(scrapeJob(testUrl)).rejects.toThrow('HTTP error! status: 404');
  });

  it('should properly clean HTML and remove CSS styling', async () => {
    // Mock fetch with HTML containing CSS styling
    mockFetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve(`
          <html>
            <head>
              <title>Senior Developer</title>
              <style>
                .job-title { color: blue; font-size: 24px; }
                .company { font-weight: bold; }
                .description { line-height: 1.5; }
              </style>
            </head>
            <body>
              <div class="job-title" style="color: red; margin: 10px;">Senior Developer</div>
              <div class="company" style="font-family: Arial;">Tech Corp</div>
              <div class="location">San Francisco, CA</div>
              <div class="description" style="padding: 20px;">
                <p style="margin-bottom: 15px;">We are looking for a senior developer to join our team.</p>
                <ul style="list-style-type: disc;">
                  <li style="margin: 5px 0;">5+ years of experience</li>
                  <li style="margin: 5px 0;">Strong JavaScript skills</li>
                </ul>
              </div>
            </body>
          </html>
        `)
      })
    );

    const result = await scrapeJob(testUrl, {
      outputBaseDir: testOutputDir
    });

    // Verify that CSS is removed and content is clean
    expect(result.jobData.position).toBe('Senior Developer');
    expect(result.jobData.employer).toBe('Tech Corp');
    expect(result.jobData.location).toBe('San Francisco, CA');
    
    // Check that the description contains the content without CSS
    const expectedContent = 'We are looking for a senior developer to join our team. 5+ years of experience Strong JavaScript skills';
    expect(result.jobData.description).toContain(expectedContent);
    
    // Verify that no CSS/style content is present
    expect(result.jobData.description).not.toContain('style=');
    expect(result.jobData.description).not.toContain('margin');
    expect(result.jobData.description).not.toContain('padding');
    expect(result.jobData.description).not.toContain('color');
    expect(result.jobData.description).not.toContain('font-');
  });
}); 