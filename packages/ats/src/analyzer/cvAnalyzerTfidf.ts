// cvAnalyzerTfidf.ts
// TF-IDF-based CVAnalyzer implementation
import type { CVData } from '@dzb-cv/types';
import type { JobPosting } from '@dzb-cv/types/job';
import { TfIdf, WordTokenizer } from 'natural';
import {
  extractKeywords,
  getEducationLevels,
  getExperienceYears,
  generateSuggestions,
  DEFAULT_STOP_WORDS,
} from './analyzer-utils';

/**
 * AnalysisResult for TF-IDF analyzer.
 */
export interface AnalysisResult {
  score: number;
  keywordMatches: string[];
  missingKeywords: string[];
  suggestions: string[];
}

/**
 * CVAnalyzer using TF-IDF and tokenization for keyword matching.
 */
export class CVAnalyzer {
  private tfidf: TfIdf;
  private tokenizer: WordTokenizer;
  private readonly stopWords: Set<string>;
  constructor() {
    this.tfidf = new TfIdf();
    this.tokenizer = new WordTokenizer();
    this.stopWords = DEFAULT_STOP_WORDS;
  }

  /**
   * Analyzes a CV against a job posting using TF-IDF and tokenization.
   */
  public analyze(cv: CVData, posting: JobPosting): AnalysisResult {
    if (!cv || !posting) {
      return {
        score: 0,
        keywordMatches: [],
        missingKeywords: [],
        suggestions: ['CV or job posting is missing.'],
      };
    }
    // Handle empty job posting
    if (
      !posting.description &&
      !posting.responsibilities?.length &&
      !posting.qualifications?.length &&
      !posting.skills?.length
    ) {
      return {
        score: 0,
        keywordMatches: [],
        missingKeywords: [],
        suggestions: ['The job posting is empty. Add job details for analysis.'],
      };
    }
    const cvText = this.extractCVText(cv);
    const jobText = this.extractJobText(posting);
    // Add documents to TF-IDF (per analysis)
    const tfidf = new TfIdf();
    tfidf.addDocument(cvText);
    tfidf.addDocument(jobText);
    // Extract keywords from job posting
    const jobKeywords = extractKeywords(jobText, this.stopWords);
    // Create a mapping of lowercase -> original case for keywords
    const keywordCaseMap = new Map<string, string>();
    jobKeywords.forEach((keyword) => {
      keywordCaseMap.set(keyword.toLowerCase(), keyword);
    });
    // Extract CV tokens and convert to lowercase for matching
    const cvTokens = this.tokenizer.tokenize(cvText) || [];
    const cvTokensLower = new Set(cvTokens.map((token) => token.toLowerCase()));
    const cvTextLower = cvText.toLowerCase();
    // Check if a keyword exists in the CV
    const keywordExistsInCV = (keyword: string): boolean => {
      const keywordLower = keyword.toLowerCase();
      return cvTokensLower.has(keywordLower) || cvTextLower.includes(keywordLower);
    };
    // Match using lowercase for test compatibility
    const keywordMatchesLower = Array.from(keywordCaseMap.keys())
      .filter(keywordExistsInCV)
      .map((kw) => kw.toLowerCase());
    const missingKeywordsLower = Array.from(keywordCaseMap.keys())
      .filter((keyword) => !keywordExistsInCV(keyword))
      .map((kw) => kw.toLowerCase());
    // Calculate scores
    const keywordScore = jobKeywords.length ? keywordMatchesLower.length / jobKeywords.length : 0;
    const [cvYears, requiredYears] = getExperienceYears(cv, posting);
    const [cvLevel, requiredLevel] = getEducationLevels(cv, posting);
    const experienceScore = requiredYears ? Math.min(1, cvYears / requiredYears) : 0.5;
    const educationScore = requiredLevel ? Math.min(1, cvLevel / requiredLevel) : 0.5;
    const score = keywordScore * 0.5 + experienceScore * 0.3 + educationScore * 0.2;
    // Generate suggestions
    const suggestions = generateSuggestions(cv, posting, missingKeywordsLower);
    return {
      score,
      keywordMatches: keywordMatchesLower,
      missingKeywords: missingKeywordsLower,
      suggestions,
    };
  }

  /**
   * Extracts text from a CV.
   */
  private extractCVText(cv: CVData): string {
    const parts = [
      cv.personalInfo.name.full,
      cv.personalInfo.contact.email,
      ...cv.experience.map(
        (exp) => `${exp.position} ${exp.employer} ${exp.responsibilities.join(' ')}`
      ),
      ...cv.education.map((edu) => `${edu.degree} ${edu.field} ${edu.institution}`),
      ...cv.skills.map((skill) => skill.name),
    ];
    return parts.join(' ');
  }

  /**
   * Extracts text from a job posting.
   */
  private extractJobText(posting: JobPosting): string {
    const parts = [
      posting.title,
      posting.description,
      ...(posting.responsibilities || []),
      ...(posting.qualifications || []),
      ...(posting.skills || []),
    ];
    return parts.filter(Boolean).join(' ');
  }
}

/**
 * Factory for TF-IDF analyzer.
 */
export const createAnalyzer = (): CVAnalyzer => new CVAnalyzer();
