export * from './engine/index.js';
export * from './scoring/index.js';
export * from './taxonomies/index.js';

// Expose both analyzers; classic is the default
export { CVAnalyzer, createAnalyzer } from './analyzer/cvAnalyzerClassic';
export * from './analyzer/cvAnalyzerTfidf';
// Default export for backward compatibility (classic analyzer)
export {
  CVAnalyzer as DefaultCVAnalyzer,
  createAnalyzer as createDefaultAnalyzer,
} from './analyzer/cvAnalyzerClassic';
