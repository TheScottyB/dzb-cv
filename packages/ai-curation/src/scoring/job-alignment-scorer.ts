/**
 * Job Alignment Scorer
 * 
 * This module evaluates how well each piece of CV content aligns with
 * specific job requirements, including keyword matching, skill relevance,
 * experience alignment, and qualification matching.
 */

import type { ContentItem, ContentScore, JobContext } from '../types/curation.js';

/**
 * Job Alignment Scoring
 */
export class JobAlignmentScorer {
  private weights: {
    keywordRelevance: number;
    skillAlignment: number;
    experienceRelevance: number;
    recencyScore: number;
    impactScore: number;
    sectorRelevance: number;
  };

  constructor(weights?: Partial<typeof this.weights>) {
    this.weights = {
      keywordRelevance: 0.3,
      skillAlignment: 0.2,
      experienceRelevance: 0.2,
      recencyScore: 0.1,
      impactScore: 0.1,
      sectorRelevance: 0.1,
      ...weights
    };
  }

  /**
   * Scores a list of content items against a given job context
   */
  public scoreContentItems(contentItems: ContentItem[], jobContext: JobContext): ContentScore[] {
    return contentItems.map((item) => this.scoreContentItem(item, jobContext));
  }

  /**
   * Scores a single content item against the job context
   */
  private scoreContentItem(item: ContentItem, jobContext: JobContext): ContentScore {
    const keywordRelevance = this.calculateKeywordRelevance(item, jobContext);
    const skillAlignment = this.calculateSkillAlignment(item, jobContext);
    const experienceRelevance = this.calculateExperienceRelevance(item, jobContext);

    const overallScore = this.calculateOverallScore({
      keywordRelevance,
      skillAlignment,
      experienceRelevance,
      recencyScore: item.metadata.recency,
      impactScore: item.metadata.impact,
      sectorRelevance: this.calculateSectorRelevance(item, jobContext)
    });

    return {
      contentId: item.id,
      overallScore,
      components: {
        keywordRelevance,
        skillAlignment,
        experienceRelevance,
        recencyScore: item.metadata.recency,
        impactScore: item.metadata.impact,
        sectorRelevance: this.calculateSectorRelevance(item, jobContext)
      },
      confidence: 0.8, // This confidence is a placeholder; it could be dynamic depending on analysis depth
      reasoning: [`Matched keywords: ${keywordRelevance}`, `Skill alignment: ${skillAlignment}`]
    };
  }

  /**
   * Calculates the relevance of keywords in a content item
   */
  private calculateKeywordRelevance(item: ContentItem, jobContext: JobContext): number {
    const itemKeywords = item.metadata.keywords.map((k) => k.toLowerCase());
    const jobKeywords = jobContext.description.toLowerCase().split(' ');

    const matches = itemKeywords.filter((kw) => jobKeywords.includes(kw));
    return matches.length / Math.max(itemKeywords.length, 1);
  }

  /**
   * Calculates how well the content item's skills align with job requirements
   */
  private calculateSkillAlignment(item: ContentItem, jobContext: JobContext): number {
    if (item.type !== 'skill') return 0;
    const skill = item.content.toLowerCase();
    return jobContext.requiredSkills.map((s) => s.toLowerCase()).includes(skill) ? 1 : 0;
  }

  /**
   * Evaluates the relevance of the experience content
   */
  private calculateExperienceRelevance(item: ContentItem, jobContext: JobContext): number {
    if (item.type !== 'experience' || !jobContext.experienceLevel) return 0;

    const yearsRequired = parseInt(jobContext.experienceLevel.replace(/[^0-9]/g, '') || '0', 10);
    const itemYears = item.metadata.dateRange ? this.calculateYears(item.metadata.dateRange) : 0;
    
    return itemYears >= yearsRequired ? 1 : itemYears / Math.max(yearsRequired, 1);
  }

  /**
   * Calculates overall alignment score based on component evaluation
   */
  private calculateOverallScore(components: ContentScore['components']): number {
    return (
      components.keywordRelevance * this.weights.keywordRelevance +
      components.skillAlignment * this.weights.skillAlignment +
      components.experienceRelevance * this.weights.experienceRelevance +
      components.recencyScore * this.weights.recencyScore +
      components.impactScore * this.weights.impactScore +
      components.sectorRelevance * this.weights.sectorRelevance
    );
  }

  /**
   * Sector relevance is a proxy based on content sector tags
   */
  private calculateSectorRelevance(item: ContentItem, jobContext: JobContext): number {
    if (item.metadata.sectors.includes(jobContext.sector)) {
      return 1.0;
    }
    return 0.3; // Lower relevance if not explicitly matching
  }

  /**
   * Helper to calculate number of years from a date range
   */
  private calculateYears(dateRange: { start: string; end?: string }): number {
    const startYear = new Date(dateRange.start).getFullYear();
    const endYear = dateRange.end ? new Date(dateRange.end).getFullYear() : new Date().getFullYear();
    return Math.max(0, endYear - startYear);
  }
}


