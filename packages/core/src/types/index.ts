/**
 * Central type definition exports for the CV generation system
 * 
 * This file exports all type definitions used throughout the project,
 * serving as the single entry point for importing types.
 */

// Re-export all base types from common
export * from '@dzb-cv/common';

// Export core-specific types that don't conflict with common types
export * from './job-analysis.js';
export * from './config-types.js';
export * from './parsers.js';
export * from './validation.js';
export * from './scoring.js';

// Define core-specific config
export interface CoreConfig {
  storageProvider: string;
  templateProvider: string;
  debug?: boolean;
}

// Re-export vendor type declarations
export type { Document } from 'docx4js';

// Note: Do not export Profile-related types that would conflict with common types
// export * from './profile-management.js'; - REMOVED to avoid conflicts
// export * from './academic-types.js'; - REMOVED to avoid conflicts
export * from './docx4js.js';
export * from './vendor.js';

