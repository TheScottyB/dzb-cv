/**
 * AI Content Curation Package
 * 
 * Intelligent CV content curation system that analyzes full CVs and makes
 * smart decisions about what content to include in targeted 1-page versions.
 */

// Core types
export * from './types/curation.js';

// Content analysis
export { ContentAnalyzer } from './analysis/content-analyzer.js';

// Job alignment scoring
export { JobAlignmentScorer } from './scoring/job-alignment-scorer.js';

// Content ranking
export { ContentRanker, type RankedContentItem } from './ranking/content-ranker.js';

// Main AI agent
export { ContentCurator, defaultAIConfig } from './agent/content-curator.js';
