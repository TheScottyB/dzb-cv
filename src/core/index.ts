/**
 * Core module exports
 */

// Export all types from the types module
export * from './types/index.js';

// Export services
export * from './services/index.js';

// Configure default exports for direct imports
export { ServiceFactory } from './services/index.js';
export { CVService } from './services/cv-service.js';
