// Job Site Detection and Strategy Selection
// @version 1.0

import { JobSite, type SiteParsingStrategy } from './types.js';

export class SiteDetector {
  private static strategies: Map<JobSite, SiteParsingStrategy> = new Map([
    [JobSite.LINKEDIN, {
      selectors: {
        title: '.top-card-layout__title, .job-details-jobs-unified-top-card__job-title h1',
        company: '.top-card-layout__card .topcard__org-name-link, .job-details-jobs-unified-top-card__company-name a',
        location: '.top-card-layout__card .topcard__flavor--bullet:first-child, .job-details-jobs-unified-top-card__bullet',
        description: '.description__text, .job-details-jobs-unified-top-card__job-description-text',
        requirements: '.job-criteria ul',
        qualifications: '.qualifications-section, .job-details-how-you-match__skills-section',
        benefits: '.benefits-section, .job-details-benefits-module'
      },
      preprocessing: {
        removeElements: ['.job-details-jobs-unified-top-card__actions', '.jobs-poster__text'],
        cleanupRules: ['span.visually-hidden', 'button']
      },
      postprocessing: {
        titleCleanup: [/\\s+at\\s+.+$/i],
        descriptionFilters: [/show more/i, /show less/i]
      }
    }],
    
    [JobSite.INDEED, {
      selectors: {
        title: '[data-testid=\"jobsearch-JobInfoHeader-title\"], .jobsearch-JobInfoHeader-title',
        company: '[data-testid=\"inlineHeader-companyName\"], .jobsearch-InlineCompanyRating-companyHeader',
        location: '[data-testid=\"job-location\"], .jobsearch-JobInfoHeader-subtitle > div:first-child',
        description: '[data-section=\"jobDescriptionText\"], .jobsearch-jobDescriptionText',
        salary: '.jobsearch-JobMetadataHeader-item:contains(\"$\")'
      },
      preprocessing: {
        removeElements: ['.jobsearch-JobComponent-footer', '.np:contains(\"Report job\")'],
        cleanupRules: ['[data-testid=\"job-snapshot\"]']
      }
    }],
    
    [JobSite.USAJOBS, {
      selectors: {
        title: '.usajobs-job-title, h1.job-title',
        company: '.agency-name, .usajobs-job-announcement-header-agency',
        location: '.locations .location, .usajobs-job-announcement-location',
        description: '.job-summary, .usajobs-job-announcement-summary',
        requirements: '.requirements-section, .job-requirements',
        qualifications: '.qualifications-section',
        salary: '.salary-range, .usajobs-job-announcement-salary'
      }
    }],
    
    [JobSite.MONSTER, {
      selectors: {
        title: '.job-header h1, .job-title',
        company: '.company-name, .job-company',
        location: '.job-location, .location',
        description: '.job-description, .job-summary',
        salary: '.salary-info'
      }
    }],
    
    [JobSite.GLASSDOOR, {
      selectors: {
        title: '[data-test=\"job-title\"], .job-title',
        company: '[data-test=\"employer-name\"], .employer-name',
        location: '[data-test=\"job-location\"], .job-location',
        description: '[data-test=\"jobDescriptionContent\"], .job-description-content',
        salary: '[data-test=\"pay-range\"], .salary-estimate'
      }
    }],
    
    [JobSite.GENERIC, {
      selectors: {
        title: 'h1, .job-title, [class*=\"title\"], [id*=\"title\"]',
        company: '.company, .employer, [class*=\"company\"], [class*=\"employer\"]',
        location: '.location, [class*=\"location\"]',
        description: '.description, .job-description, [class*=\"description\"], main p, article p',
        requirements: '.requirements, [class*=\"requirement\"]',
        qualifications: '.qualifications, [class*=\"qualification\"]'
      }
    }]
  ]);

  /**
   * Identifies which job site a URL belongs to
   */
  public static identifyJobSite(url: string): JobSite {
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('linkedin.com')) return JobSite.LINKEDIN;
    if (urlLower.includes('indeed.com')) return JobSite.INDEED;
    if (urlLower.includes('usajobs.gov')) return JobSite.USAJOBS;
    if (urlLower.includes('monster.com')) return JobSite.MONSTER;
    if (urlLower.includes('glassdoor.com')) return JobSite.GLASSDOOR;
    
    return JobSite.GENERIC;
  }

  /**
   * Gets parsing strategy for a specific job site
   */
  public static getStrategy(jobSite: JobSite): SiteParsingStrategy {
    const strategy = this.strategies.get(jobSite);
    if (!strategy) {
      throw new Error(`No parsing strategy found for job site: ${jobSite}`);
    }
    return strategy;
  }

  /**
   * Gets parsing strategy for a URL
   */
  public static getStrategyForUrl(url: string): { jobSite: JobSite; strategy: SiteParsingStrategy } {
    const jobSite = this.identifyJobSite(url);
    const strategy = this.getStrategy(jobSite);
    return { jobSite, strategy };
  }

  /**
   * Registers a custom parsing strategy for a job site
   */
  public static registerStrategy(jobSite: JobSite, strategy: SiteParsingStrategy): void {
    this.strategies.set(jobSite, strategy);
  }

  /**
   * Gets all available job sites
   */
  public static getAvailableSites(): JobSite[] {
    return Array.from(this.strategies.keys());
  }

  /**
   * Checks if a job site is supported
   */
  public static isSupported(jobSite: JobSite): boolean {
    return this.strategies.has(jobSite);
  }

  /**
   * Gets the default user agent for web scraping
   */
  public static getDefaultUserAgent(): string {
    return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  }

  /**
   * Gets site-specific headers
   */
  public static getSiteHeaders(jobSite: JobSite): Record<string, string> {
    const baseHeaders = {
      'User-Agent': this.getDefaultUserAgent(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    };

    // Site-specific header customizations
    switch (jobSite) {
      case JobSite.LINKEDIN:
        return {
          ...baseHeaders,
          'Referer': 'https://www.linkedin.com/',
        };
      case JobSite.INDEED:
        return {
          ...baseHeaders,
          'Referer': 'https://www.indeed.com/',
        };
      case JobSite.GLASSDOOR:
        return {
          ...baseHeaders,
          'Referer': 'https://www.glassdoor.com/',
        };
      default:
        return baseHeaders;
    }
  }
}