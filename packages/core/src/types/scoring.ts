/**
 * Scoring algorithm type definitions
 */
import type { CVData } from './cv-base.js';
import type { JobPosting } from './job-analysis.js';

export enum ImportanceLevel {
  High = 'high',
  Medium = 'medium',
  Low = 'low'
}
export interface ScoringWeights {
  skills: number;
  experience: number;
  education: number;
  certifications: number;
  keywords: number;
}

export interface KeywordMatch {
  term: string;
  count: number;
  context: string[];
  importance: ImportanceLevel;  // Changed from string literal to enum
}

export interface SkillMatch {
  name: string;
  relevance: number;
  experienceYears?: number;
  contextualScore: number;
}

export interface ExperienceMatch {
  position: string;
  relevance: number;
  duration: number;
  recentness: number;
  responsibilities: Array<{
    text: string;
    relevance: number;
  }>;
}

export interface ScoringOptions {
  weights?: Partial<ScoringWeights>;
  minimumScore?: number;
  considerRecentness?: boolean;
  recentnessWeight?: number;
  keywordImportance?: Record<string, number>;
  customScoring?: {
    name: string;
    weight: number;
    algorithm: (cv: CVData, job: JobPosting) => number;
  }[];
}

export interface DetailedScore {
  overall: number;
  categories: {
    skills: {
      score: number;
      matches: SkillMatch[];
    };
    experience: {
      score: number;
      matches: ExperienceMatch[];
    };
    education: {
      score: number;
      relevance: number;
    };
    keywords: {
      score: number;
      matches: KeywordMatch[];
    };
  };
  analysis: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
}

export type WeightedScore<T> = {
  item: T;
  score: number;
  weight: number;
};

export type NormalizedScore = number & { __brand: 'NormalizedScore' };

// Add type guard
export function isNormalizedScore(score: number): score is NormalizedScore {
  return score >= 0 && score <= 1;
}
