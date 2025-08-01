import type { CVData } from '@dzb-cv/types';
import type { JobPosting } from '@dzb-cv/types/job';
import {
  extractKeywords,
  getEducationLevels,
  getExperienceYears,
  generateSuggestions,
  DEFAULT_STOP_WORDS,
} from './analyzer-utils';

/**
 * Base analysis result interface
 */
export interface BaseAnalysisResult {
  score: number;
  keywordMatches: string[];
  missingKeywords: string[];
  suggestions: string[];
  formattingIssues: string[];
}

/**
 * Configuration options for analyzers
 */
export interface AnalyzerOptions {
  keywordWeight?: number;
  experienceWeight?: number;
  educationWeight?: number;
  enableTfIdf?: boolean;
  customStopWords?: string[];
}

/**
 * Abstract base class for CV analyzers
 */
export abstract class BaseCVAnalyzer {
  protected readonly stopWords: Set<string>;
  protected readonly options: Required<AnalyzerOptions>;

  constructor(options: AnalyzerOptions = {}) {
    this.options = {
      keywordWeight: 0.5,
      experienceWeight: 0.3,
      educationWeight: 0.2,
      enableTfIdf: false,
      customStopWords: [],
      ...options,
    };

    this.stopWords = new Set([
      ...DEFAULT_STOP_WORDS,
      ...this.options.customStopWords,
    ]);
  }

  /**
   * Main analysis method - to be implemented by subclasses
   */
  public abstract analyze(cv: CVData, posting: JobPosting): BaseAnalysisResult;

  /**
   * Validates input data and returns early result if invalid
   */
  protected validateInputs(cv: CVData, posting: JobPosting): BaseAnalysisResult | null {
    if (!cv || !posting) {
      return {
        score: 0,
        keywordMatches: [],
        missingKeywords: [],
        suggestions: ['CV or job posting is missing.'],
        formattingIssues: [],
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
        formattingIssues: [],
      };
    }

    // Handle empty CV
    if (!cv || (!cv.experience.length && !cv.education.length && !cv.skills.length)) {
      return {
        score: 0,
        keywordMatches: [],
        missingKeywords: extractKeywords(this.extractJobText(posting), this.stopWords),
        suggestions: ['CV is empty or missing critical sections.'],
        formattingIssues: [],
      };
    }

    return null;
  }

  /**
   * Extracts text from a job posting
   */
  protected extractJobText(posting: JobPosting): string {
    const parts: string[] = [];
    if (posting.title) parts.push(posting.title);
    if (posting.description) parts.push(posting.description);
    if (posting.skills && posting.skills.length) parts.push(posting.skills.join(' '));
    if (posting.qualifications && posting.qualifications.length)
      parts.push(posting.qualifications.join(' '));
    if (posting.responsibilities && posting.responsibilities.length)
      parts.push(posting.responsibilities.join(' '));
    return parts.join(' ');
  }

  /**
   * Extracts text from a CV
   */
  protected extractCVText(cv: CVData): string {
    const parts: string[] = [];
    if (cv.personalInfo?.summary) parts.push(cv.personalInfo.summary);
    if (cv.personalInfo?.name?.full) parts.push(cv.personalInfo.name.full);
    
    for (const exp of cv.experience) {
      parts.push(exp.position);
      parts.push(exp.employer);
      if (exp.responsibilities && exp.responsibilities.length)
        parts.push(exp.responsibilities.join(' '));
      if (exp.achievements && exp.achievements.length) 
        parts.push(exp.achievements.join(' '));
    }
    
    for (const edu of cv.education) {
      parts.push(edu.degree);
      parts.push(edu.field);
      parts.push(edu.institution);
    }
    
    if (cv.skills && cv.skills.length) {
      for (const skill of cv.skills) parts.push(skill.name);
    }
    
    return parts.join(' ');
  }

  /**
   * Calculates the overall score based on component scores
   */
  protected calculateOverallScore(
    keywordScore: number,
    experienceScore: number,
    educationScore: number
  ): number {
    const score =
      keywordScore * this.options.keywordWeight +
      experienceScore * this.options.experienceWeight +
      educationScore * this.options.educationWeight;

    return Math.min(1, Math.max(0, score));
  }

  /**
   * Performs keyword matching between CV and job posting
   */
  protected performKeywordMatching(
    cvText: string,
    jobText: string
  ): { matches: string[]; missing: string[] } {
    const jobKeywords = extractKeywords(jobText, this.stopWords);
    const cvKeywords = extractKeywords(cvText, this.stopWords);

    const keywordMatchesLower = jobKeywords.filter((k) =>
      cvKeywords.some((cvKeyword) => cvKeyword.toLowerCase() === k.toLowerCase())
    );

    const keywordMatches = keywordMatchesLower.map((keyword) => {
      const match = cvKeywords.find(
        (cvKeyword) => cvKeyword.toLowerCase() === keyword.toLowerCase()
      );
      return match || keyword;
    });

    const missingKeywords = jobKeywords.filter(
      (k) => !cvKeywords.some((cvKeyword) => cvKeyword.toLowerCase() === k.toLowerCase())
    );

    return {
      matches: keywordMatches.map((k) => k.toLowerCase()),
      missing: missingKeywords.map((k) => k.toLowerCase()),
    };
  }

  /**
   * Calculates experience and education scores
   */
  protected calculateComponentScores(
    cv: CVData,
    posting: JobPosting
  ): { experienceScore: number; educationScore: number } {
    const [cvYears, requiredYears] = getExperienceYears(cv, posting);
    const [cvLevel, requiredLevel] = getEducationLevels(cv, posting);

    const experienceScore = requiredYears ? Math.min(1, cvYears / requiredYears) : 0.5;
    const educationScore = requiredLevel ? Math.min(1, cvLevel / requiredLevel) : 0.5;

    return { experienceScore, educationScore };
  }
}
