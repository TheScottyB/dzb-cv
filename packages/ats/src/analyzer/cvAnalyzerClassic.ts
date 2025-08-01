import { CVData, JobPosting, ATSAnalysis } from '@dzb-cv/types';
import { BaseCVAnalyzer } from './base-analyzer';
import { generateSuggestions } from './analyzer-utils';

/**
 * CVAnalyzer analyzes a CV against a job posting to determine compatibility (classic version).
 */
export class CVAnalyzer extends BaseCVAnalyzer {
  constructor() {
    super();
  }

  /**
   * Analyzes a CV against a job posting.
   */
  public analyze(cv: CVData, posting: JobPosting): ATSAnalysis {
    const earlyResult = this.validateInputs(cv, posting);
    if (earlyResult) return earlyResult;

    // Extract job and CV text
    const jobText = this.extractJobText(posting);
    const cvText = this.extractCVText(cv);
    
    // Perform keyword matching
    const { matches: keywordMatches, missing: missingKeywords } = 
      this.performKeywordMatching(cvText, jobText);

    // Calculate component scores
    const { experienceScore, educationScore } = this.calculateComponentScores(cv, posting);

    // Calculate keyword score
    const keywordScore = keywordMatches.length / (keywordMatches.length + missingKeywords.length);

    // Calculate overall score
    const score = this.calculateOverallScore(keywordScore, experienceScore, educationScore);

    // Generate suggestions
    const suggestions = generateSuggestions(cv, posting, missingKeywords);

    return {
      score,
      keywordMatches,
      missingKeywords,
      suggestions,
      formattingIssues: [],
    };
  }
}

/**
 * Factory for classic analyzer.
 */
export const createAnalyzer = (): CVAnalyzer => new CVAnalyzer();
