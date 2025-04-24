import type { JobPostingAnalysis } from '../types/cv-types.js';
/**
 * Analyzes a job posting URL and extracts relevant information
 */
export declare function analyzeJobPosting(url: string, options?: {
    skipRateLimiting?: boolean;
    forceGenericParser?: boolean;
}): Promise<JobPostingAnalysis>;
/**
 * Extracts key terms from text content
 *
 * @param text The text content to analyze for key terms
 * @param additionalTerms Optional additional terms to look for beyond common skills
 * @returns An array of unique key terms found in the text
 */
export declare function extractKeyTerms(text: string, additionalTerms?: string[]): string[];
