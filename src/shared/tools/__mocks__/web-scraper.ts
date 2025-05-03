import { vi } from 'vitest';
import type { JobPosting } from '../types';

export const scrapeJobPosting = vi.fn().mockImplementation(async (): Promise<JobPosting> => ({
  url: 'https://example.com/jobs/12345',
  title: 'Mock Job Title',
  company: 'Mock Company',
  location: 'Mock Location',
  description: 'Mock job description',
  responsibilities: ['Mock responsibility 1', 'Mock responsibility 2'],
  qualifications: ['Mock qualification 1', 'Mock qualification 2'],
  htmlPath: 'test-output/example-12345/job.html',
  screenshotPath: 'test-output/example-12345/screenshot.png'
}));

export default { scrapeJobPosting };
