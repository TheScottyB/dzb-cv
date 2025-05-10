import type { CVData } from '@dzb-cv/types';
import type { JobPosting } from '@dzb-cv/types/job';
import natural from 'natural';

export interface ScoringCriteria {
  /** Weight for keyword matching */
  keywordWeight?: number;
  /** Weight for experience matching */
  experienceWeight?: number;
  /** Weight for education matching */
  educationWeight?: number;
  /** Weight for skills matching */
  skillsWeight?: number;
}

export interface SectionScore {
  score: number;
  matches: string[];
  missing: string[];
  suggestions: string[];
}

export interface CVScore {
  overall: number;
  keywords: SectionScore;
  experience: SectionScore;
  education: SectionScore;
  skills: SectionScore;
}

const DEFAULT_WEIGHTS: Required<ScoringCriteria> = {
  keywordWeight: 0.3,
  experienceWeight: 0.3,
  educationWeight: 0.2,
  skillsWeight: 0.2,
};

export class ScoringEngine {
  private tokenizer: natural.WordTokenizer;
  private weights: Required<ScoringCriteria>;

  constructor(criteria?: ScoringCriteria) {
    this.tokenizer = new natural.WordTokenizer();
    this.weights = { ...DEFAULT_WEIGHTS, ...criteria };
  }

  /**
   * Score a CV against a job posting
   */
  public score(cv: CVData, posting: JobPosting): CVScore {
    const keywordScore = this.scoreKeywords(cv, posting);
    const experienceScore = this.scoreExperience(cv, posting);
    const educationScore = this.scoreEducation(cv, posting);
    const skillsScore = this.scoreSkills(cv, posting);

    const overall =
      keywordScore.score * this.weights.keywordWeight +
      experienceScore.score * this.weights.experienceWeight +
      educationScore.score * this.weights.educationWeight +
      skillsScore.score * this.weights.skillsWeight;

    return {
      overall,
      keywords: keywordScore,
      experience: experienceScore,
      education: educationScore,
      skills: skillsScore,
    };
  }

  private scoreKeywords(cv: CVData, posting: JobPosting): SectionScore {
    const cvText = [
      cv.personalInfo.name.full,
      ...cv.experience.map((e) => `${e.position} ${e.employer} ${e.responsibilities.join(' ')}`),
      ...cv.education.map((e) => `${e.degree} ${e.field}`),
      ...cv.skills.map((s) => s.name),
    ]
      .join(' ')
      .toLowerCase();

    const jobText = [
      posting.title,
      posting.description,
      ...(posting.responsibilities || []),
      ...(posting.qualifications || []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const cvTokens = new Set(this.tokenizer.tokenize(cvText));
    const jobTokens = new Set(this.tokenizer.tokenize(jobText));

    const matches = [...jobTokens].filter((token) => cvTokens.has(token));
    const missing = [...jobTokens].filter((token) => !cvTokens.has(token));
    const denom = matches.length + missing.length;
    return {
      score: denom === 0 ? 0 : matches.length / denom,
      matches,
      missing,
      suggestions: missing.length > 0 ? [`Add missing keywords: ${missing.join(', ')}`] : [],
    };
  }

  private scoreExperience(cv: CVData, posting: JobPosting): SectionScore {
    const requiredYears = this.extractYearsFromPosting(posting);
    const actualYears = this.calculateTotalExperience(cv);

    const score = Math.min(actualYears / requiredYears, 1);
    const suggestions: string[] = [];

    if (actualYears < requiredYears) {
      suggestions.push(
        `Job requires ${requiredYears} years of experience, you have ${actualYears}`
      );
    }

    return {
      score,
      matches: [`${actualYears} years of experience`],
      missing:
        actualYears < requiredYears ? [`${requiredYears - actualYears} more years needed`] : [],
      suggestions,
    };
  }

  private scoreEducation(cv: CVData, posting: JobPosting): SectionScore {
    const requiredDegrees = this.extractRequiredDegrees(posting);
    const matches = cv.education.filter((edu) =>
      requiredDegrees.some((req) => edu.degree.toLowerCase().includes(req.toLowerCase()))
    );
    const missing = requiredDegrees.filter(
      (req) => !cv.education.some((edu) => edu.degree.toLowerCase().includes(req.toLowerCase()))
    );
    return {
      score: requiredDegrees.length === 0 ? 0 : matches.length / requiredDegrees.length,
      matches: matches.map((m) => m.degree),
      missing,
      suggestions: missing.map((deg) => `Missing required degree: ${deg}`),
    };
  }

  private scoreSkills(cv: CVData, posting: JobPosting): SectionScore {
    const requiredSkills = posting.skills || [];
    const cvSkills = cv.skills.map((s) => s.name.toLowerCase());
    const matches = requiredSkills.filter((skill) =>
      cvSkills.some((cvSkill) => cvSkill.includes(skill.toLowerCase()))
    );
    const missing = requiredSkills.filter(
      (skill) => !cvSkills.some((cvSkill) => cvSkill.includes(skill.toLowerCase()))
    );
    return {
      score: requiredSkills.length === 0 ? 0 : matches.length / requiredSkills.length,
      matches,
      missing,
      suggestions: missing.map((skill) => `Add missing skill: ${skill}`),
    };
  }

  private extractYearsFromPosting(posting: JobPosting): number {
    // Default to 2 years if no experience requirement is found
    const defaultYears = 2;

    if (!posting.description) return defaultYears;

    const yearPattern = /(\d+)[\s-]*years?/i;
    const match = posting.description.match(yearPattern);

    return match && match[1] ? parseInt(match[1], 10) : defaultYears;
  }

  private calculateTotalExperience(cv: CVData): number {
    return cv.experience.reduce((total, exp) => {
      const endDate = exp.endDate ? new Date(exp.endDate) : new Date();
      const startDate = new Date(exp.startDate);
      const years =
        endDate.getFullYear() -
        startDate.getFullYear() +
        (endDate.getMonth() - startDate.getMonth()) / 12;
      return total + years;
    }, 0);
  }

  private extractRequiredDegrees(posting: JobPosting): string[] {
    const degrees = new Set<string>();
    const degreePatterns = [
      /bachelor'?s?\s+degree/i,
      /master'?s?\s+degree/i,
      /ph\.?d\.?/i,
      /doctorate/i,
      /mba/i,
    ];

    const textToSearch = [posting.description, ...(posting.qualifications || [])]
      .filter(Boolean)
      .join(' ');

    degreePatterns.forEach((pattern) => {
      const match = textToSearch.match(pattern);
      if (match) {
        degrees.add(match[0]);
      }
    });

    return Array.from(degrees);
  }
}

export const createScoringEngine = (criteria?: ScoringCriteria): ScoringEngine =>
  new ScoringEngine(criteria);
