export * from './cv-base';
export * from './cv-templates';

/**
 * Central Type Definitions
 * 
 * This module serves as the central export point for all type definitions used throughout the application.
 * It consolidates common types to ensure consistency and prevent duplication.
 * 
 * All imports should use the @types path alias for better maintainability:
 * 
 * @example
 * import { CVData, Experience } from '@types/cv-base';
 * import { TemplateOptions } from '@types/cv-types';
 */

// Core CV Types
export * from './cv-base.js';
export * from './cv-types.js';
export * from './cv-generation.js';

// Profile Management Types
export * from './profile-management.js';

// Configuration Types
export * from './config-types.js';

// Job Analysis Types
export * from './job-analysis.js';

// Academic CV Types
export * from './academic-types.js';

// Parser Types
export * from './parsers.js';

// ATS-related Types
export * from './ats-types.js';

// All future type exports should be added here

// Template Types
export * from './cv-templates.js';

// Scoring Types
export * from './scoring.js';

// Validation Types
export * from './validation.js';
