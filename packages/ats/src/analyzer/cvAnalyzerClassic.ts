import { CVData, JobPosting, ATSAnalysis } from '@dzb-cv/types';
import {
  extractKeywords,
  getEducationLevels,
  getExperienceYears,
  generateSuggestions,
  DEFAULT_STOP_WORDS,
} from './analyzer-utils';

/**
 * CVAnalyzer analyzes a CV against a job posting to determine compatibility (classic version).
 */
export class CVAnalyzer {
  private readonly stopWords: Set<string>;
  constructor() {
    this.stopWords = DEFAULT_STOP_WORDS;
  }

  /**
   * Analyzes a CV against a job posting.
   */
  public analyze(cv: CVData, posting: JobPosting): ATSAnalysis {
    if (!cv || !posting) {
      return {
        score: 0,
        keywordMatches: [],
        missingKeywords: [],
        suggestions: ['CV or job posting is missing.'],
        formattingIssues: [],
      };
    }
    // Handle edge cases
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
        suggestions: posting ? ['The job posting is empty. Add job details for analysis.'] : [],
        formattingIssues: [],
      };
    }
    if (!cv || (!cv.experience.length && !cv.education.length && !cv.skills.length)) {
      return {
        score: 0,
        keywordMatches: [],
        missingKeywords: extractKeywords(this.extractJobText(posting), this.stopWords),
        suggestions: ['CV is empty or missing critical sections.'],
        formattingIssues: [],
      };
    }
    // Extract job and CV text
    const jobText = this.extractJobText(posting);
    const cvText = this.extractCVText(cv);
    // Extract keywords
    const jobKeywords = extractKeywords(jobText, this.stopWords);
    const cvKeywords = extractKeywords(cvText, this.stopWords);
    // Find keyword matches and missing keywords
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
    // Normalize keywordMatches and missingKeywords to lowercase for scoring/test consistency
    const keywordMatchesLowered = keywordMatches.map((k) => k.toLowerCase());
    const missingKeywordsLowered = missingKeywords.map((k) => k.toLowerCase());
    // Calculate scores
    const keywordScore = jobKeywords.length ? keywordMatchesLower.length / jobKeywords.length : 0;
    const [cvYears, requiredYears] = getExperienceYears(cv, posting);
    const [cvLevel, requiredLevel] = getEducationLevels(cv, posting);
    const experienceScore = requiredYears ? Math.min(1, cvYears / requiredYears) : 0.5;
    const educationScore = requiredLevel ? Math.min(1, cvLevel / requiredLevel) : 0.5;
    const score =
      !isNaN(keywordScore) && !isNaN(experienceScore) && !isNaN(educationScore)
        ? keywordScore * 0.5 + experienceScore * 0.3 + educationScore * 0.2
        : 0;
    // Generate suggestions
    const suggestions = generateSuggestions(cv, posting, missingKeywords);
    return {
      score: Math.min(1, Math.max(0, score)),
      keywordMatches: keywordMatchesLowered,
      missingKeywords: missingKeywordsLowered,
      suggestions,
      formattingIssues: [],
    };
  }

  /**
   * Extracts text from a job posting.
   */
  private extractJobText(posting: JobPosting): string {
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
   * Extracts text from a CV.
   */
  private extractCVText(cv: CVData): string {
    const parts: string[] = [];
    if (cv.personalInfo?.summary) parts.push(cv.personalInfo.summary);
    for (const exp of cv.experience) {
      parts.push(exp.position);
      parts.push(exp.employer);
      if (exp.responsibilities && exp.responsibilities.length)
        parts.push(exp.responsibilities.join(' '));
      if (exp.achievements && exp.achievements.length) parts.push(exp.achievements.join(' '));
    }
    for (const edu of cv.education) {
      parts.push(edu.degree);
      parts.push(edu.field);
      parts.push(edu.institution);
    }
    if (cv.skills && cv.skills.length) for (const skill of cv.skills) parts.push(skill.name);
    return parts.join(' ');
  }
}

/**
 * Factory for classic analyzer.
 */
export const createAnalyzer = (): CVAnalyzer => new CVAnalyzer();
