// cvAnalyzerTfidf.ts
// TF-IDF-based CVAnalyzer implementation
import type { CVData } from '@dzb-cv/types';
import type { JobPosting } from '@dzb-cv/types/job';
import { TfIdf, WordTokenizer } from 'natural';
import { BaseCVAnalyzer, BaseAnalysisResult } from './base-analyzer';
import { generateSuggestions, extractKeywords } from './analyzer-utils';

/**
 * AnalysisResult for TF-IDF analyzer.
 */
export interface AnalysisResult extends BaseAnalysisResult {}

/**
 * CVAnalyzer using TF-IDF and tokenization for keyword matching.
 */
export class TFIDFCVAnalyzer extends BaseCVAnalyzer {
  private tfidf: TfIdf;
  private tokenizer: WordTokenizer;
  constructor() {
    super();
    this.tfidf = new TfIdf();
    this.tokenizer = new WordTokenizer();
  }

  /**
   * Analyzes a CV against a job posting using TF-IDF and tokenization.
   */
  public analyze(cv: CVData, posting: JobPosting): AnalysisResult {
    const earlyResult = this.validateInputs(cv, posting);
    if (earlyResult) return earlyResult;

    const cvText = this.extractCVText(cv);
    const jobText = this.extractJobText(posting);

    // Add documents to TF-IDF (per analysis)
    this.tfidf.addDocument(cvText);
    this.tfidf.addDocument(jobText);

    // Extract keywords from job posting
    const jobKeywords = extractKeywords(jobText, this.stopWords);

    // Perform keyword matching
    const keywordCaseMap = new Map<string, string>();
    jobKeywords.forEach((keyword) => {
      keywordCaseMap.set(keyword.toLowerCase(), keyword);
    });

    const cvTokens = this.tokenizer.tokenize(cvText) || [];
    const cvTokensLower = new Set(cvTokens.map((token) => token.toLowerCase()));
    const cvTextLower = cvText.toLowerCase();

    const { matches: keywordMatches, missing: missingKeywords } =
      this.performKeywordMatching(cvText, jobText);

    // Calculate scores
    const { experienceScore, educationScore } =
      this.calculateComponentScores(cv, posting);

    const score = this.calculateOverallScore(
      jobKeywords.length ? keywordMatches.length / jobKeywords.length : 0,
      experienceScore,
      educationScore
    );

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
 * Factory for TF-IDF analyzer.
 */
export const createTFIDFAnalyzer = (): TFIDFCVAnalyzer => new TFIDFCVAnalyzer();

/**
 * Backward compatibility export
 */
export const CVAnalyzer = TFIDFCVAnalyzer;
export const createAnalyzer = createTFIDFAnalyzer;
