import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JobScraper } from './scraper.js';
import type { ScraperResult } from '../types/job-posting.js';
import puppeteer from 'puppeteer';

vi.mock('./web-scraper');

const mockUrl = 'https://example.com/jobs/123';

describe('JobScraper', () => {
  let scraper: JobScraper;
  
  beforeEach(() => {
    scraper = new JobScraper();
    vi.clearAllMocks();
  });
  
  it('should scrape job posting successfully', async () => {
    const mockPage = {
      goto: vi.fn(),
      content: vi.fn().mockResolvedValue('<html><body>Mock content</body></html>'),
      screenshot: vi.fn(),
      pdf: vi.fn()
    };
    
    const mockBrowser = {
      newPage: vi.fn().mockResolvedValue(mockPage),
      close: vi.fn()
    };
    
    vi.mocked(puppeteer.launch).mockResolvedValue(mockBrowser as any);
    
    const result = await scraper.scrape('https://example.com/job');
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(mockPage.goto).toHaveBeenCalledWith('https://example.com/job', expect.any(Object));
    expect(mockBrowser.close).toHaveBeenCalled();
  });
  
  it('should handle errors gracefully', async () => {
    const error = new Error('Failed to launch browser');
    vi.mocked(puppeteer.launch).mockRejectedValue(error);
    
    const result = await scraper.scrape('https://example.com/job');
    
    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to launch browser');
  });

  it('should successfully scrape job information', async () => {
    const mockPage = {
      goto: vi.fn().mockResolvedValue(null),
      waitForTimeout: vi.fn().mockResolvedValue(null),
      evaluate: vi.fn().mockResolvedValue({
        title: 'Test Job',
        company: 'Test Company',
        location: 'Test Location',
        description: 'Test Description',
        responsibilities: ['Responsibility 1'],
        qualifications: ['Qualification 1'],
        skills: ['Skill 1'],
        education: ['Education 1'],
        experience: ['Experience 1'],
        metadata: {
          postedDate: '2024-01-01',
          closingDate: '2024-02-01',
          salary: '$50,000',
          employmentType: 'Full-time'
        }
      }),
      content: vi.fn().mockResolvedValue('<html>test</html>'),
      screenshot: vi.fn().mockResolvedValue(null),
      pdf: vi.fn().mockResolvedValue(null)
    };

    const mockBrowser = {
      newPage: vi.fn().mockResolvedValue(mockPage),
      close: vi.fn().mockResolvedValue(null)
    };

    vi.mocked(puppeteer.launch).mockResolvedValue(mockBrowser as any);

    const result = await scraper.scrape(mockUrl);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.title).toBe('Test Job');
    expect(result.data?.company).toBe('Test Company');
    expect(result.metadata.duration).toBeGreaterThan(0);
  });

  it('should handle errors during scraping', async () => {
    vi.mocked(puppeteer.launch).mockRejectedValue(new Error('Test error'));

    const result = await scraper.scrape(mockUrl);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Test error');
    expect(result.metadata.duration).toBeGreaterThan(0);
  });

  it('should extract job info correctly', async () => {
    const mockPage = {
      evaluate: vi.fn().mockResolvedValue({
        title: 'Test Job',
        company: 'Test Company',
        location: 'Test Location',
        description: 'Test Description',
        responsibilities: ['Responsibility 1'],
        qualifications: ['Qualification 1'],
        skills: ['Skill 1'],
        education: ['Education 1'],
        experience: ['Experience 1'],
        metadata: {
          postedDate: '2024-01-01',
          closingDate: '2024-02-01',
          salary: '$50,000',
          employmentType: 'Full-time'
        }
      })
    };

    const result = await scraper['extractJobInfo'](mockPage as any);

    expect(result.title).toBe('Test Job');
    expect(result.company).toBe('Test Company');
    expect(result.location).toBe('Test Location');
    expect(result.description).toBe('Test Description');
    expect(result.responsibilities).toContain('Responsibility 1');
    expect(result.qualifications).toContain('Qualification 1');
    expect(result.skills).toContain('Skill 1');
    expect(result.education).toContain('Education 1');
    expect(result.experience).toContain('Experience 1');
    expect(result.metadata?.postedDate).toBe('2024-01-01');
  });
}); 