import type { CVData } from '@dzb-cv/types';
import type { JobPosting } from '@dzb-cv/types/job';

import { CVAnalyzer, type AnalysisResult } from '../analyzer/index.js';
import { ScoringEngine, type CVScore, type ScoringCriteria } from '../scoring/index.js';
import { SkillMatcher, type SkillDefinition } from '../taxonomies/index.js';

export interface ATSResult {
  /** Overall match score */
  score: number;
  /** Detailed analysis results */
  analysis: AnalysisResult;
  /** Section-by-section scoring */
  scoring: CVScore;
  /** Optimization suggestions */
  suggestions: string[];
  /** Missing skills with recommendations */
  missingSkills: {
    skill: string;
    alternatives?: SkillDefinition[] | undefined;
  }[];
}

export interface ATSOptions {
  /** Scoring criteria weights */
  scoring?: ScoringCriteria;
  /** Custom skill definitions */
  skills?: SkillDefinition[];
  /** Minimum required score (0-1) */
  minimumScore?: number;
}

/**
 * Main ATS engine that coordinates analysis, scoring, and optimization
 */
export class ATSEngine {
  private analyzer: CVAnalyzer;
  private scorer: ScoringEngine;
  private skillMatcher: SkillMatcher;
  private minimumScore: number;

  constructor(options: ATSOptions = {}) {
    this.analyzer = new CVAnalyzer();
    this.scorer = new ScoringEngine(options.scoring);
    this.skillMatcher = new SkillMatcher(options.skills);
    this.minimumScore = options.minimumScore || 0.6;
  }

  /**
   * Analyze and score a CV against a job posting
   */
  public async analyze(cv: CVData, posting: JobPosting): Promise<ATSResult> {
    // Run analysis
    const analysis = this.analyzer.analyze(cv, posting);

    // Run scoring
    const scoring = this.scorer.score(cv, posting);

    // Generate suggestions based on analysis and scoring
    const suggestions = this.generateSuggestions(cv, posting, analysis, scoring);

    // Find missing skills and alternatives
    const missingSkills = this.findMissingSkills(cv, posting);

    return {
      score: scoring.overall,
      analysis,
      scoring,
      suggestions,
      missingSkills,
    };
  }

  /**
   * Check if a CV meets minimum requirements for a job
   */
  public meetsRequirements(cv: CVData, posting: JobPosting): boolean {
    const score = this.scorer.score(cv, posting);
    return score.overall >= this.minimumScore;
  }

  /**
   * Get optimization suggestions for improving CV match
   */
  private generateSuggestions(
    cv: CVData,
    posting: JobPosting,
    analysis: AnalysisResult,
    scoring: CVScore
  ): string[] {
    const suggestions: Set<string> = new Set();

    // Add analysis suggestions
    analysis.suggestions.forEach((s) => suggestions.add(s));

    // Add scoring suggestions
    [
      scoring.keywords.suggestions,
      scoring.experience.suggestions,
      scoring.education.suggestions,
      scoring.skills.suggestions,
    ]
      .flat()
      .forEach((s) => suggestions.add(s));

    // Add skill-specific suggestions
    const missingSkills = this.findMissingSkills(cv, posting);
    missingSkills.forEach(({ skill, alternatives }) => {
      if (alternatives?.length) {
        suggestions.add(
          `Consider adding "${skill}" or related skills: ${alternatives.map((a) => a.name).join(', ')}`
        );
      }
    });

    // Add format suggestions if needed
    if (!cv.personalInfo.professionalTitle) {
      suggestions.add('Add a professional title to your CV');
    }

    return Array.from(suggestions);
  }

  /**
   * Find missing skills and potential alternatives
   */
  private findMissingSkills(
    cv: CVData,
    posting: JobPosting
  ): {
    skill: string;
    alternatives?: SkillDefinition[] | undefined;
  }[] {
    const requiredSkills = posting.skills || [];
    const cvSkills = new Set(cv.skills.map((s) => s.name.toLowerCase()));

    return requiredSkills
      .filter((skill) => !cvSkills.has(skill.toLowerCase()))
      .map((skill) => {
        const skillDef = this.skillMatcher.findSkill(skill);
        const alternatives = skillDef
          ? this.skillMatcher
              .getRelatedSkills(skill)
              .filter((s) => cvSkills.has(s.name.toLowerCase()))
          : undefined;

        return { skill, alternatives };
      });
  }
}

/**
 * Create a new ATS engine instance
 */
export const createATSEngine = (options?: ATSOptions): ATSEngine => new ATSEngine(options);
