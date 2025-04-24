import type { JobPostingAnalysis } from '../types/cv-types.js';
/**
 * Analyzes a job posting URL and extracts relevant information
 */
export declare function analyzeJobPosting(url: string, options?: {
    skipRateLimiting?: boolean;
    forceGenericParser?: boolean;
}): Promise<JobPostingAnalysis>;
