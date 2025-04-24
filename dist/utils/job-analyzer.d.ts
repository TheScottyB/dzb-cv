import type { JobPostingAnalysis } from '../types/cv-types.js';
/**
 * Extracts key terms from text content
 */
export declare function extractKeyTerms(text: string, additionalTerms?: string[]): string[];
export declare function analyzeJobPosting(url: string, options?: {
    skipRateLimiting?: boolean;
    forceGenericParser?: boolean;
}): Promise<JobPostingAnalysis>;
