// Job Analyzer - Main Entry Point
// @version 1.0

import { createError, ErrorHandler } from '@dzb-cv/errors';
import { ContentFetcher } from './content-fetcher.js';
import { ContentParser } from './content-parser.js';
import { RateLimiter } from './rate-limiter.js';
import { SiteDetector } from './site-detector.js';
import type {
  JobAnalysisResult,
  ParsedJobContent,
  FetchOptions,
  ParsingOptions,
  RateLimitConfig,
} from './types.js';

export class JobAnalyzer {
  private contentFetcher: ContentFetcher;
  private rateLimiter: RateLimiter;

  constructor(rateLimitConfig?: Partial<RateLimitConfig>) {
    this.rateLimiter = new RateLimiter(rateLimitConfig);
    this.contentFetcher = new ContentFetcher(this.rateLimiter);
  }

  /**
   * Analyzes a job posting from a URL
   */
  public async analyzeJob(
    url: string,
    fetchOptions: FetchOptions = {},
    parsingOptions: ParsingOptions = {}
  ): Promise<JobAnalysisResult> {
    const startTime = Date.now();
    let fetchMetrics = { fetchTime: 0, retries: 0 };

    try {
      // Validate URL
      this.validateUrl(url);

      // Fetch content
      const { dom, jobSite, metrics } = await this.contentFetcher.fetchJobContent(url, fetchOptions);
      fetchMetrics = metrics;

      // Validate content
      const validation = this.contentFetcher.validateJobContent(dom, url);
      if (!validation.isValid) {
        throw createError.jobPostingParse(
          url,
          `Content validation failed (confidence: ${validation.confidence}%): ${validation.issues.join(', ')}`
        );
      }

      // Parse content
      const parseStartTime = Date.now();
      const parsedContent = ContentParser.parseJobContent(dom, url, parsingOptions);
      const parseTime = Date.now() - parseStartTime;

      // Validate parsed content
      const contentValidation = ContentParser.validateParsedContent(parsedContent);
      if (!contentValidation.isValid) {
        console.warn(`Parsed content quality issues for ${url}:`, contentValidation.issues);
      }

      const totalTime = Date.now() - startTime;

      return {
        success: true,
        data: parsedContent,
        metrics: {
          fetchTime: fetchMetrics.fetchTime,
          parseTime,
          totalTime,
          retries: fetchMetrics.retries,
        },
      };

    } catch (error) {
      const processedError = ErrorHandler.handle(error);
      const totalTime = Date.now() - startTime;

      return {
        success: false,
        error: {
          message: processedError.message,
          type: processedError.code,
          details: processedError.context,
        },
        metrics: {
          fetchTime: fetchMetrics.fetchTime,
          parseTime: 0,
          totalTime,
          retries: fetchMetrics.retries,
        },
      };
    }
  }

  /**
   * Analyzes multiple job postings concurrently
   */
  public async analyzeJobs(
    urls: string[],
    fetchOptions: FetchOptions = {},
    parsingOptions: ParsingOptions = {},
    concurrency: number = 3
  ): Promise<JobAnalysisResult[]> {
    // Process URLs in chunks to respect rate limits
    const results: JobAnalysisResult[] = [];
    
    for (let i = 0; i < urls.length; i += concurrency) {
      const chunk = urls.slice(i, i + concurrency);
      const chunkPromises = chunk.map(url => 
        this.analyzeJob(url, fetchOptions, parsingOptions)
      );
      
      const chunkResults = await Promise.all(chunkPromises);
      results.push(...chunkResults);
      
      // Brief pause between chunks
      if (i + concurrency < urls.length) {
        await this.delay(1000);
      }
    }

    return results;
  }

  /**
   * Gets supported job sites
   */
  public getSupportedSites(): string[] {
    return SiteDetector.getAvailableSites();
  }

  /**
   * Checks if a URL is from a supported job site
   */
  public isSupported(url: string): boolean {
    const jobSite = SiteDetector.identifyJobSite(url);
    return SiteDetector.isSupported(jobSite);
  }

  /**
   * Gets job site information for a URL
   */
  public getJobSiteInfo(url: string) {
    const jobSite = SiteDetector.identifyJobSite(url);
    return {
      site: jobSite,
      supported: SiteDetector.isSupported(jobSite),
      strategy: SiteDetector.getStrategy(jobSite),
    };
  }

  /**
   * Updates rate limiting configuration
   */
  public updateRateLimit(config: Partial<RateLimitConfig>): void {
    this.rateLimiter.updateConfig(config);
  }

  /**
   * Gets current rate limit status
   */
  public getRateLimitStatus() {
    return {
      config: this.rateLimiter.getConfig(),
      canMakeRequest: this.rateLimiter.canMakeRequest(),
      waitTime: this.rateLimiter.getWaitTime(),
    };
  }

  /**
   * Validates URL format and accessibility
   */
  private validateUrl(url: string): void {
    try {
      new URL(url);
    } catch (error) {
      throw createError.validation('Invalid URL format', 'url', url);
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      throw createError.validation('URL must use HTTP or HTTPS protocol', 'url', url);
    }
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export all types and classes
export * from './types.js';
export * from './content-fetcher.js';
export * from './content-parser.js';
export * from './rate-limiter.js';
export * from './site-detector.js';

// Export default instance
export const jobAnalyzer = new JobAnalyzer();

// Legacy compatibility - recreate the main function from the original script
export async function analyzeJobPosting(url: string): Promise<ParsedJobContent> {
  const result = await jobAnalyzer.analyzeJob(url);
  
  if (!result.success || !result.data) {
    throw new Error(result.error?.message || 'Job analysis failed');
  }
  
  return result.data;
}