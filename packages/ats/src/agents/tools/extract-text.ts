import type { JobPosting } from '@dzb-cv/types/job';
import { load } from 'cheerio';

/**
 * Extracts text content from HTML job descriptions
 * @param html Raw HTML content
 * @returns Cleaned text content
 */
export function extractText(html: string): string {
  const $ = load(html);

  // Remove script and style elements
  $('script, style').remove();

  // Get text content and clean it up
  return $('body').text().replace(/\s+/g, ' ').trim();
}

/**
 * Extracts relevant sections from a job posting
 * @param posting Job posting data
 * @returns Structured text sections
 */
export function extractSections(posting: JobPosting): {
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
} {
  return {
    title: posting.title,
    description: posting.description || '',
    requirements: posting.qualifications || [],
    responsibilities: posting.responsibilities || [],
  };
}
