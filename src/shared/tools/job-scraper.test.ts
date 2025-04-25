import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { scrapeJob } from './job-scraper.js';
import fs from 'fs/promises';
import path from 'path';
import { TEST_OUTPUT_DIR } from '../../test/setup';

// Store original fetch for cleanup
const originalFetch = global.fetch;

describe('Job Scraper', () => {
  const testUrl = 'https://example.com/jobs/12345';
  const testOutputDir = path.join(TEST_OUTPUT_DIR, 'job-scraper-test');

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Mock fs.mkdir to prevent actual directory creation
    vi.spyOn(fs, 'mkdir').mockResolvedValue(undefined);
    vi.spyOn(fs, 'writeFile').mockResolvedValue(undefined);
  });

  afterEach(async () => {
    // Restore fetch
    global.fetch = originalFetch;
    
    // Clean up test output directory
    try {
      await fs.rm(testOutputDir, { recursive: true, force: true });
    } catch (error) {
      console.warn('Failed to clean up test directory:', error);
    }
  });

  it('should create output directory and save files', async () => {
    const mockHTML = `
      <html>
        <head>
          <title>Mock Job Title</title>
          <meta property="og:site_name" content="Mock Company">
          <meta property="og:description" content="Mock Location">
        </head>
        <body>
          <h1>Mock Job Title</h1>
          <div class="company">Mock Company</div>
          <div class="location">Mock Location</div>
          <div class="description">Mock job description</div>
        </body>
      </html>
    `;

    // Mock fetch response
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(mockHTML)
    });

    const result = await scrapeJob(testUrl, {
      outputBaseDir: testOutputDir
    });

    expect(result.jobData.position).toBe('Mock Job Title');
    expect(result.jobData.employer).toBe('Mock Company');
    expect(result.jobData.location).toBe('Mock Location');
    expect(result.jobData.description).toBe('Mock job description');
    expect(fs.mkdir).toHaveBeenCalled();
    expect(fs.writeFile).toHaveBeenCalledTimes(2);
  });

  it('should handle invalid URLs gracefully', async () => {
    const invalidUrl = 'not-a-url';
    await expect(scrapeJob(invalidUrl)).rejects.toThrow('Invalid URL');
  });

  it('should handle HTTP errors', async () => {
    // Mock fetch to return error
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404
    });

    await expect(scrapeJob(testUrl)).rejects.toThrow('HTTP error! status: 404');
  });

  it('should properly clean HTML and remove CSS styling', async () => {
    const mockHTML = `
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
          <div class="description" style="padding: 20px;">We are looking for a senior developer to join our team. 5+ years of experience Strong JavaScript skills</div>
        </body>
      </html>
    `;

    // Mock fetch response
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(mockHTML)
    });

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
