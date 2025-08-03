// Performance Optimization Utilities
// @version 1.0

// Memory management utilities
export class MemoryManager {
  private static cacheStore = new Map<string, { data: unknown; timestamp: number; ttl: number }>();

  /**
   * Cache data with TTL (time to live)
   */
  public static cache<T>(key: string, data: T, ttlMs: number = 300000): T {
    this.cacheStore.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
    return data;
  }

  /**
   * Get cached data if not expired
   */
  public static getCached<T>(key: string): T | null {
    const entry = this.cacheStore.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cacheStore.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Clear expired cache entries
   */
  public static clearExpired(): number {
    const now = Date.now();
    let cleared = 0;

    for (const [key, entry] of Array.from(this.cacheStore.entries())) {
      if (now - entry.timestamp > entry.ttl) {
        this.cacheStore.delete(key);
        cleared++;
      }
    }

    return cleared;
  }

  /**
   * Clear all cache
   */
  public static clearAll(): void {
    this.cacheStore.clear();
  }

  /**
   * Get cache statistics
   */
  public static getStats() {
    const now = Date.now();
    let valid = 0;
    let expired = 0;

    for (const entry of Array.from(this.cacheStore.values())) {
      if (now - entry.timestamp > entry.ttl) {
        expired++;
      } else {
        valid++;
      }
    }

    return {
      total: this.cacheStore.size,
      valid,
      expired,
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  private static estimateMemoryUsage(): number {
    // Rough estimation of memory usage in bytes
    let size = 0;
    for (const [key, entry] of Array.from(this.cacheStore.entries())) {
      size += key.length * 2; // UTF-16 characters
      size += JSON.stringify(entry.data).length * 2;
      size += 24; // timestamp + ttl + object overhead
    }
    return size;
  }
}

// Debounce utility for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), waitMs);
  };
}

// Throttle utility for performance optimization
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limitMs: number
): (...args: Parameters<T>) => void {
  let lastExec = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastExec >= limitMs) {
      func(...args);
      lastExec = now;
    }
  };
}

// Batch processing utility
export class BatchProcessor<T, R> {
  private batch: T[] = [];
  private timeoutId: NodeJS.Timeout | null = null;

  constructor(
    private processor: (items: T[]) => Promise<R[]>,
    private batchSize: number = 10,
    private flushIntervalMs: number = 1000
  ) {}

  /**
   * Add item to batch for processing
   */
  public add(item: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.batch.push(item);
      
      // Store resolve/reject for this item
      const itemIndex = this.batch.length - 1;
      
      if (this.batch.length >= this.batchSize) {
        this.flush().then(results => resolve(results[itemIndex])).catch(reject);
      } else {
        // Schedule flush if not already scheduled
        if (!this.timeoutId) {
          this.timeoutId = setTimeout(() => {
            this.flush().then(results => resolve(results[itemIndex])).catch(reject);
          }, this.flushIntervalMs);
        }
      }
    });
  }

  /**
   * Process current batch immediately
   */
  public async flush(): Promise<R[]> {
    if (this.batch.length === 0) return [];

    const currentBatch = [...this.batch];
    this.batch = [];
    
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    return await this.processor(currentBatch);
  }
}

// Stream processing utilities
export class StreamProcessor {
  /**
   * Process large arrays in chunks to avoid blocking the event loop
   */
  public static async processInChunks<T, R>(
    items: T[],
    processor: (item: T) => R | Promise<R>,
    chunkSize: number = 100,
    delayMs: number = 0
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      const chunkResults = await Promise.all(chunk.map(processor));
      results.push(...chunkResults);
      
      // Allow other operations to run
      if (delayMs > 0 && i + chunkSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    
    return results;
  }

  /**
   * Transform stream-like processing with backpressure
   */
  public static async* transform<T, R>(
    items: Iterable<T>,
    transformer: (item: T) => Promise<R>,
    concurrency: number = 5
  ): AsyncGenerator<R> {
    const iterator = items[Symbol.iterator]();
    const inProgress = new Set<Promise<{ result: R; index: number }>>();
    let index = 0;
    let done = false;

    while (!done || inProgress.size > 0) {
      // Fill up to concurrency limit
      while (inProgress.size < concurrency && !done) {
        const next = iterator.next();
        if (next.done) {
          done = true;
          break;
        }

        const currentIndex = index++;
        const promise = transformer(next.value).then(result => ({ result, index: currentIndex }));
        inProgress.add(promise);
      }

      if (inProgress.size > 0) {
        // Wait for at least one to complete
        const completed = await Promise.race(inProgress);
        inProgress.delete(Promise.resolve(completed));
        yield completed.result;
      }
    }
  }
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private static metrics = new Map<string, number[]>();

  /**
   * Time a function execution
   */
  public static async time<T>(
    operation: string,
    fn: () => Promise<T> | T
  ): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;

    this.recordMetric(operation, duration);

    return { result, duration };
  }

  /**
   * Record a performance metric
   */
  public static recordMetric(operation: string, value: number): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    
    const values = this.metrics.get(operation)!;
    values.push(value);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }

  /**
   * Get performance statistics for an operation
   */
  public static getStats(operation: string): {
    count: number;
    min: number;
    max: number;
    avg: number;
    median: number;
  } | null {
    const values = this.metrics.get(operation);
    if (!values || values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const count = values.length;
    const min = sorted[0];
    const max = sorted[count - 1];
    const avg = values.reduce((sum, val) => sum + val, 0) / count;
    const median = sorted[Math.floor(count / 2)];

    return { count, min, max, avg, median };
  }

  /**
   * Get all recorded metrics
   */
  public static getAllStats(): Record<string, ReturnType<typeof PerformanceMonitor.getStats>> {
    const stats: Record<string, any> = {};
    for (const operation of Array.from(this.metrics.keys())) {
      stats[operation] = this.getStats(operation);
    }
    return stats;
  }

  /**
   * Clear metrics for an operation
   */
  public static clearMetrics(operation?: string): void {
    if (operation) {
      this.metrics.delete(operation);
    } else {
      this.metrics.clear();
    }
  }
}

// Memoization utility for expensive computations
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// Export all utilities
export {
  debounce as performanceDebounce,
  throttle as performanceThrottle,
  memoize as performanceMemoize,
};