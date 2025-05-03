/**
 * Common types shared across the application
 * 
 * This file exports common type definitions used throughout the project.
 */

// Environment type
export type Environment = 'development' | 'production' | 'test';

// Common configuration type
export type CommonConfig = {
  version: string;
  environment: Environment;
  debug?: boolean;
};

// Base error type for consistent error handling
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Common response type for API responses
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// Common pagination types
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Export CV-related types
export * from './cv-base';
export * from './pdf-generation';
