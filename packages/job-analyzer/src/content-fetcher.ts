// Content Fetcher for Job Postings
// @version 1.0

import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';
import { createError } from '@dzb-cv/errors';
import { RateLimiter } from './rate-limiter.js';
import { SiteDetector } from './site-detector.js';
import type { FetchOptions } from './types.js';
import { JobSite } from './types.js';

export class ContentFetcher {
  private rateLimiter: RateLimiter;

  constructor(rateLimiter?: RateLimiter) {
    this.rateLimiter = rateLimiter || new RateLimiter();
  }

  /**
   * Fetches HTML content from a job posting URL
   */
  public async fetchJobContent(url: string, options: FetchOptions = {}): Promise<{
    html: string;
    dom: JSDOM;
    jobSite: JobSite;
    metrics: { fetchTime: number; retries: number };
  }> {
    const startTime = Date.now();
    let retryCount = 0;

    const jobSite = SiteDetector.identifyJobSite(url);
    const headers = {
      ...SiteDetector.getSiteHeaders(jobSite),
      ...options.headers,
    };

    const fetchOptions = {
      timeout: options.timeout || 30000,
      retries: options.retries || 3,
      userAgent: options.userAgent || SiteDetector.getDefaultUserAgent(),
      followRedirects: options.followRedirects !== false,
      ...options,
    };

    try {
      const html = await this.rateLimiter.withRetry(async () => {
        retryCount++;
        const response = await fetch(url, {
          headers,
          follow: fetchOptions.followRedirects ? 20 : 0,
        } as any);

        if (!response.ok) {
          throw createError.api(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            url
          );
        }

        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('text/html')) {
          throw createError.api(
            `Expected HTML content, got: ${contentType}`,
            undefined,
            url,
            { contentType }
          );
        }

        return await response.text();
      }, `fetch job content from ${url}`);

      const dom = new JSDOM(html, {
        url,
        referrer: this.getReferrer(jobSite),
        contentType: 'text/html',
        includeNodeLocations: false,
        storageQuota: 1000000,
      });

      const fetchTime = Date.now() - startTime;

      return {
        html,
        dom,
        jobSite,
        metrics: {
          fetchTime,
          retries: retryCount - 1, // Subtract 1 because first attempt isn't a retry
        },
      };

    } catch (error) {
      throw createError.api(
        `Failed to fetch job content: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        url,
        { 
          fetchTime: Date.now() - startTime,
          retries: retryCount,
          jobSite 
        },
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Validates that the fetched content appears to be a job posting
   */
  public validateJobContent(dom: JSDOM, url: string): {
    isValid: boolean;
    confidence: number;
    issues: string[];
  } {
    const document = dom.window.document;
    const issues: string[] = [];
    let confidence = 0;

    // Check for common job posting indicators
    const indicators = [
      { selector: 'h1, .job-title, [class*=\"title\"]', weight: 30, name: 'Job title' },
      { selector: '.company, .employer, [class*=\"company\"]', weight: 25, name: 'Company name' },
      { selector: '.location, [class*=\"location\"]', weight: 20, name: 'Job location' },
      { selector: '.description, [class*=\"description\"], p', weight: 20, name: 'Job description' },
      { selector: '.salary, [class*=\"salary\"], [class*=\"pay\"]', weight: 5, name: 'Salary information' },
    ];

    for (const indicator of indicators) {
      const elements = document.querySelectorAll(indicator.selector);
      if (elements.length > 0) {
        confidence += indicator.weight;
      } else {
        issues.push(`Missing ${indicator.name}`);
      }
    }

    // Check content length
    const textContent = document.body?.textContent || '';
    if (textContent.length < 100) {
      issues.push('Content too short (less than 100 characters)');
      confidence -= 20;
    } else if (textContent.length < 500) {
      issues.push('Content seems short (less than 500 characters)');
      confidence -= 10;
    }

    // Check for anti-bot measures
    if (textContent.includes('blocked') || textContent.includes('captcha') || textContent.includes('bot')) {
      issues.push('Possible anti-bot detection');
      confidence -= 30;
    }

    // Check for job-specific keywords
    const jobKeywords = ['job', 'position', 'role', 'career', 'employment', 'hire', 'work', 'apply'];
    const foundKeywords = jobKeywords.filter(keyword => 
      textContent.toLowerCase().includes(keyword)
    );
    
    if (foundKeywords.length === 0) {
      issues.push('No job-related keywords found');
      confidence -= 15;
    } else {
      confidence += Math.min(foundKeywords.length * 2, 10);
    }

    return {
      isValid: confidence >= 50,
      confidence: Math.max(0, Math.min(100, confidence)),
      issues,
    };
  }

  /**
   * Gets appropriate referrer for the job site
   */
  private getReferrer(jobSite: JobSite): string {
    switch (jobSite) {
      case JobSite.LINKEDIN:
        return 'https://www.linkedin.com/';
      case JobSite.INDEED:
        return 'https://www.indeed.com/';
      case JobSite.USAJOBS:
        return 'https://www.usajobs.gov/';
      case JobSite.MONSTER:
        return 'https://www.monster.com/';
      case JobSite.GLASSDOOR:
        return 'https://www.glassdoor.com/';
      default:
        return 'https://www.google.com/';
    }
  }

  /**
   * Updates rate limiter configuration
   */
  public updateRateLimiter(rateLimiter: RateLimiter): void {
    this.rateLimiter = rateLimiter;
  }

  /**
   * Gets current rate limiter
   */
  public getRateLimiter(): RateLimiter {
    return this.rateLimiter;
  }
}