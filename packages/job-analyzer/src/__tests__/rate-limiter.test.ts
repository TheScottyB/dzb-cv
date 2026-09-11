// Rate Limiter Tests
// @version 1.0

import { vi } from 'vitest';
import { RateLimiter } from '../rate-limiter.js';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter({
      minTimeBetweenRequests: 100, // 100ms for faster tests
      maxRetries: 2,
      retryDelay: 50,
    });
  });

  describe('Rate limiting enforcement', () => {
    test('should allow immediate first request', () => {
      expect(rateLimiter.canMakeRequest()).toBe(true);
    });

    test('should enforce minimum time between requests', async () => {
      // Make first request
      await rateLimiter.enforceRateLimit();
      
      // Immediately check - should not be allowed
      expect(rateLimiter.canMakeRequest()).toBe(false);
      expect(rateLimiter.getWaitTime()).toBeGreaterThan(0);

      // Wait for rate limit period
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(rateLimiter.canMakeRequest()).toBe(true);
    });

    test('should calculate wait time correctly', async () => {
      await rateLimiter.enforceRateLimit();
      
      const waitTime = rateLimiter.getWaitTime();
      expect(waitTime).toBeGreaterThan(0);
      expect(waitTime).toBeLessThanOrEqual(100);
    });
  });

  describe('Retry logic', () => {
    test('should succeed on first attempt if operation succeeds', async () => {
      const successFn = vi.fn().mockResolvedValue('success');
      
      const result = await rateLimiter.withRetry(successFn, 'test operation');
      
      expect(result).toBe('success');
      expect(successFn).toHaveBeenCalledTimes(1);
    });

    test('should retry on failure and eventually succeed', async () => {
      const retryFn = vi.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockResolvedValueOnce('success');
      
      const result = await rateLimiter.withRetry(retryFn, 'test operation');
      
      expect(result).toBe('success');
      expect(retryFn).toHaveBeenCalledTimes(2);
    });

    test('should fail after max retries', async () => {
      const failFn = vi.fn().mockRejectedValue(new Error('Always fails'));
      
      await expect(rateLimiter.withRetry(failFn, 'test operation')).rejects.toThrow();
      expect(failFn).toHaveBeenCalledTimes(2); // maxRetries = 2
    });

    test('should apply exponential backoff between retries', async () => {
      const startTime = Date.now();
      const failFn = vi.fn().mockRejectedValue(new Error('Always fails'));

      await expect(rateLimiter.withRetry(failFn, 'test operation')).rejects.toThrow();

      // Attempt 1 runs immediately (no prior request). It fails, so we back off
      // retryDelay * 2^0 = 50ms. Attempt 2 then hits the 100ms rate limit and
      // waits the remaining ~50ms, so the two attempts are ~100ms apart. It is
      // the last attempt, so no further backoff. Allow a little timer slop.
      const totalTime = Date.now() - startTime;
      expect(totalTime).toBeGreaterThanOrEqual(95);
      expect(failFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('Configuration updates', () => {
    test('should update configuration', () => {
      const newConfig = {
        maxRetries: 5,
        retryDelay: 2000,
      };

      rateLimiter.updateConfig(newConfig);
      
      const config = rateLimiter.getConfig();
      expect(config.maxRetries).toBe(5);
      expect(config.retryDelay).toBe(2000);
    });

    test('should preserve existing config when updating partial config', () => {
      const originalConfig = rateLimiter.getConfig();
      
      rateLimiter.updateConfig({ maxRetries: 10 });
      
      const updatedConfig = rateLimiter.getConfig();
      expect(updatedConfig.maxRetries).toBe(10);
      expect(updatedConfig.minTimeBetweenRequests).toBe(originalConfig.minTimeBetweenRequests);
    });
  });
});