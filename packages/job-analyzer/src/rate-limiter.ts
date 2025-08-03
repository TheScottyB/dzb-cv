// Rate Limiter for Job Site Requests
// @version 1.0

import { createError } from '@dzb-cv/errors';
import type { RateLimitConfig } from './types.js';

export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = {
      requestsPerMinute: 10,
      lastRequestTime: 0,
      minTimeBetweenRequests: 6000, // 6 seconds
      maxRetries: 3,
      retryDelay: 1000,
      ...config,
    };
  }

  /**
   * Enforces rate limiting before making a request
   */
  public async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.config.lastRequestTime;

    if (timeSinceLastRequest < this.config.minTimeBetweenRequests) {
      const waitTime = this.config.minTimeBetweenRequests - timeSinceLastRequest;
      console.log(`Rate limiting: waiting ${waitTime}ms before next request`);
      await this.delay(waitTime);
    }

    this.config.lastRequestTime = Date.now();
  }

  /**
   * Executes a function with retry logic and rate limiting
   */
  public async withRetry<T>(
    operation: () => Promise<T>,
    context: string = 'operation'
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        await this.enforceRateLimit();
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === this.config.maxRetries) {
          break;
        }

        const delay = this.config.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
        console.warn(`${context} attempt ${attempt} failed, retrying in ${delay}ms:`, lastError.message);
        await this.delay(delay);
      }
    }

    throw createError.api(
      `${context} failed after ${this.config.maxRetries} attempts`,
      undefined,
      undefined,
      { attempts: this.config.maxRetries, lastError: lastError?.message }
    );
  }

  /**
   * Updates rate limit configuration
   */
  public updateConfig(updates: Partial<RateLimitConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Gets current rate limit configuration
   */
  public getConfig(): RateLimitConfig {
    return { ...this.config };
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Checks if we can make a request immediately
   */
  public canMakeRequest(): boolean {
    const now = Date.now();
    return (now - this.config.lastRequestTime) >= this.config.minTimeBetweenRequests;
  }

  /**
   * Gets time until next request is allowed
   */
  public getWaitTime(): number {
    const now = Date.now();
    const timeSinceLastRequest = now - this.config.lastRequestTime;
    return Math.max(0, this.config.minTimeBetweenRequests - timeSinceLastRequest);
  }
}