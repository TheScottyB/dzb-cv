/**
 * Common utility functions shared across the application
 * 
 * This file exports utility functions used throughout the project.
 */

/**
 * Get the current environment
 * @returns The current environment (development, production, or test)
 */
export const getEnvironment = (): string => {
  return process.env.NODE_ENV || 'development';
};

/**
 * Check if the current environment is production
 * @returns True if the current environment is production
 */
export const isProduction = (): boolean => {
  return getEnvironment() === 'production';
};

