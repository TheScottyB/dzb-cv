/**
 * Storage interface for data persistence
 */
export interface Storage {
  /**
   * Save data with the given key
   */
  save(key: string, data: unknown): Promise<void>;

  /**
   * Load data for the given key
   */
  load<T>(key: string): Promise<T | null>;

  /**
   * Delete data for the given key
   */
  delete(key: string): Promise<void>;

  /**
   * List all keys in storage
   */
  list(): Promise<string[]>;

  /**
   * Check if a key exists in storage
   */
  exists(key: string): Promise<boolean>;
}
