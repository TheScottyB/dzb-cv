/**
 * Content Priority Ranking System
 * 
 * This module develops a ranking algorithm that prioritizes CV content
 * based on job alignment scores, content impact, and strategic importance
 * for the specific application context.
 */

import type { 
  ContentItem, 
  ContentScore, 
  JobContext, 
  ContentDecision,
  CurationStrategy 
} from '../types/curation.js';

/**
 * Ranked content item with priority information
 */
export interface RankedContentItem {
  item: ContentItem;
  score: ContentScore;
  priority: 'critical' | 'high' | 'medium' | 'low';
  strategicValue: number;
  finalRankingScore: number;
  rankingFactors: {
    jobAlignment: number;
    contentImpact: number;
    strategicImportance: number;
    diversity: number;
    essentialness: number;
  };
}

/**
 * Content Priority Ranker
 */
export class ContentRanker {
  private strategy: CurationStrategy;

  constructor(strategy: CurationStrategy) {
    this.strategy = strategy;
  }

  /**
   * Ranks all content items based on job alignment and strategic importance
   */
  public rankContent(
    contentItems: ContentItem[],
    scores: ContentScore[],
    jobContext: JobContext
  ): RankedContentItem[] {
    const rankedItems: RankedContentItem[] = [];

    for (const item of contentItems) {
      const score = scores.find(s => s.contentId === item.id);
      if (!score) continue;

      const strategicValue = this.calculateStrategicValue(item, jobContext);
      const rankingFactors = this.calculateRankingFactors(item, score, strategicValue, jobContext);
      const finalRankingScore = this.calculateFinalRankingScore(rankingFactors);
      const priority = this.determinePriority(finalRankingScore, item);

      rankedItems.push({
        item,
        score,
        priority,
        strategicValue,
        finalRankingScore,
        rankingFactors
      });
    }

    // Sort by final ranking score (descending)
    return rankedItems.sort((a, b) => b.finalRankingScore - a.finalRankingScore);
  }

  /**
   * Creates content decisions based on ranking and constraints
   */
  public createContentDecisions(
    rankedItems: RankedContentItem[],
    jobContext: JobContext
  ): ContentDecision[] {
    const decisions: ContentDecision[] = [];
    const constraints = this.strategy.constraints;
    
    let selectedCharacterCount = 0;
    let selectedExperienceCount = 0;
    let selectedEducationCount = 0;
    let selectedSkillsCount = 0;

    // Ensure essential content is included first
    const essentialItems = rankedItems.filter(item => 
      item.priority === 'critical' || this.isEssentialContent(item.item)
    );

    // Process essential items first
    for (const rankedItem of essentialItems) {
      const decision = this.makeContentDecision(
        rankedItem,
        constraints,
        selectedCharacterCount,
        selectedExperienceCount,
        selectedEducationCount,
        selectedSkillsCount
      );

      if (decision.include) {
        selectedCharacterCount += rankedItem.item.metadata.length;
        
        switch (rankedItem.item.type) {
          case 'experience':
            selectedExperienceCount++;
            break;
          case 'education':
            selectedEducationCount++;
            break;
          case 'skill':
            selectedSkillsCount++;
            break;
        }
      }

      decisions.push(decision);
    }

    // Process remaining items
    const remainingItems = rankedItems.filter(item => 
      !essentialItems.some(essential => essential.item.id === item.item.id)
    );

    for (const rankedItem of remainingItems) {
      const decision = this.makeContentDecision(
        rankedItem,
        constraints,
        selectedCharacterCount,
        selectedExperienceCount,
        selectedEducationCount,
        selectedSkillsCount
      );

      if (decision.include) {
        selectedCharacterCount += rankedItem.item.metadata.length;
        
        switch (rankedItem.item.type) {
          case 'experience':
            selectedExperienceCount++;
            break;
          case 'education':
            selectedEducationCount++;
            break;
          case 'skill':
            selectedSkillsCount++;
            break;
        }
      }

      decisions.push(decision);
    }

    return decisions;
  }

  /**
   * Calculates strategic value of content item based on context
   */
  private calculateStrategicValue(item: ContentItem, jobContext: JobContext): number {
    let strategicValue = 0.5; // Base value

    // Content type strategic value
    switch (item.type) {
      case 'summary':
        strategicValue = 0.95; // Almost always essential
        break;
      case 'achievement':
        strategicValue = 0.9; // Achievements are highly valuable
        break;
      case 'certification':
        strategicValue = 0.8; // Certifications show commitment
        break;
      case 'experience':
        strategicValue = 0.85; // Core experience is critical
        break;
      case 'skill':
        strategicValue = 0.7; // Skills are important but numerous
        break;
      case 'education':
        strategicValue = 0.6; // Education is baseline requirement
        break;
      case 'project':
        strategicValue = 0.5; // Projects can be supplementary
        break;
      default:
        strategicValue = 0.3;
    }

    // Sector-specific adjustments
    if (item.metadata.sectors.includes(jobContext.sector)) {
      strategicValue += 0.1;
    }

    // Recency boost for certain types
    if (['experience', 'achievement', 'certification'].includes(item.type)) {
      strategicValue += item.metadata.recency * 0.1;
    }

    // Keyword density impact
    const keywordDensity = item.metadata.keywords.length / Math.max(item.metadata.length / 100, 1);
    strategicValue += Math.min(0.1, keywordDensity * 0.02);

    return Math.min(1, strategicValue);
  }

  /**
   * Calculates various ranking factors
   */
  private calculateRankingFactors(
    item: ContentItem,
    score: ContentScore,
    strategicValue: number,
    jobContext: JobContext
  ): RankedContentItem['rankingFactors'] {
    return {
      jobAlignment: score.overallScore,
      contentImpact: item.metadata.impact,
      strategicImportance: strategicValue,
      diversity: this.calculateDiversityScore(item, jobContext),
      essentialness: this.calculateEssentialness(item)
    };
  }

  /**
   * Calculates diversity score to ensure balanced content selection
   */
  private calculateDiversityScore(item: ContentItem, jobContext: JobContext): number {
    // Diversity helps ensure we don't over-select from one area
    // This is a simplified implementation
    const sectorMatch = item.metadata.sectors.includes(jobContext.sector) ? 0.8 : 0.6;
    const contentTypeVariety = this.getContentTypeVarietyScore(item.type);
    
    return (sectorMatch + contentTypeVariety) / 2;
  }

  /**
   * Gets variety score for content type (to encourage balanced selection)
   */
  private getContentTypeVarietyScore(type: string): number {
    // Encourage variety in content types
    const typeScores: Record<string, number> = {
      'summary': 0.9,
      'experience': 0.8,
      'achievement': 0.9,
      'skill': 0.6, // Skills are numerous, so lower variety score
      'education': 0.7,
      'certification': 0.8,
      'project': 0.5,
      'responsibility': 0.4 // Responsibilities are numerous
    };

    return typeScores[type] || 0.3;
  }

  /**
   * Calculates how essential a piece of content is
   */
  private calculateEssentialness(item: ContentItem): number {
    // Some content types are more essential than others
    const essentialScores: Record<string, number> = {
      'summary': 1.0,
      'personal_info': 1.0,
      'experience': 0.9,
      'achievement': 0.8,
      'education': 0.7,
      'certification': 0.8,
      'skill': 0.6,
      'project': 0.4,
      'responsibility': 0.3
    };

    return essentialScores[item.type] || 0.2;
  }

  /**
   * Calculates final ranking score based on all factors
   */
  private calculateFinalRankingScore(factors: RankedContentItem['rankingFactors']): number {
    const weights = {
      jobAlignment: 0.35,
      contentImpact: 0.2,
      strategicImportance: 0.25,
      diversity: 0.1,
      essentialness: 0.1
    };

    return (
      factors.jobAlignment * weights.jobAlignment +
      factors.contentImpact * weights.contentImpact +
      factors.strategicImportance * weights.strategicImportance +
      factors.diversity * weights.diversity +
      factors.essentialness * weights.essentialness
    );
  }

  /**
   * Determines priority level based on ranking score
   */
  private determinePriority(finalScore: number, item: ContentItem): 'critical' | 'high' | 'medium' | 'low' {
    // Essential content types are always at least high priority
    if (this.isEssentialContent(item)) {
      return finalScore > 0.8 ? 'critical' : 'high';
    }

    if (finalScore > 0.85) return 'critical';
    if (finalScore > 0.7) return 'high';
    if (finalScore > 0.5) return 'medium';
    return 'low';
  }

  /**
   * Checks if content is essential (must be included)
   */
  private isEssentialContent(item: ContentItem): boolean {
    return ['summary', 'personal_info'].includes(item.type);
  }

  /**
   * Makes a decision about whether to include a content item
   */
  private makeContentDecision(
    rankedItem: RankedContentItem,
    constraints: CurationStrategy['constraints'],
    currentCharCount: number,
    currentExpCount: number,
    currentEduCount: number,
    currentSkillCount: number
  ): ContentDecision {
    const item = rankedItem.item;
    
    // Check if adding this item would exceed constraints
    const wouldExceedCharacters = (currentCharCount + item.metadata.length) > constraints.maxCharacters;
    const wouldExceedExperience = item.type === 'experience' && currentExpCount >= constraints.maxExperienceItems;
    const wouldExceedEducation = item.type === 'education' && currentEduCount >= constraints.maxEducationItems;
    const wouldExceedSkills = item.type === 'skill' && currentSkillCount >= constraints.maxSkills;

    // Essential content should be included despite constraints (with modifications if needed)
    if (this.isEssentialContent(item)) {
      return {
        contentId: item.id,
        include: true,
        priority: rankedItem.priority,
        reasoning: 'Essential content must be included',
        modifications: wouldExceedCharacters ? {
          shortened: this.createShortenedVersion(item.content, constraints.maxCharacters - currentCharCount)
        } : undefined
      };
    }

    // Check constraints for non-essential content
    if (wouldExceedCharacters || wouldExceedExperience || wouldExceedEducation || wouldExceedSkills) {
      return {
        contentId: item.id,
        include: false,
        priority: rankedItem.priority,
        reasoning: 'Excluded due to space/count constraints'
      };
    }

    // Include if priority is high enough
    const shouldInclude = rankedItem.priority === 'critical' || 
                         (rankedItem.priority === 'high' && rankedItem.finalRankingScore > 0.6) ||
                         (rankedItem.priority === 'medium' && rankedItem.finalRankingScore > 0.4);

    return {
      contentId: item.id,
      include: shouldInclude,
      priority: rankedItem.priority,
      reasoning: shouldInclude 
        ? `High relevance (score: ${rankedItem.finalRankingScore.toFixed(2)})` 
        : `Low relevance (score: ${rankedItem.finalRankingScore.toFixed(2)})`,
      modifications: shouldInclude && item.metadata.length > 150 ? {
        shortened: this.createShortenedVersion(item.content, 150),
        emphasize: item.metadata.keywords.slice(0, 3)
      } : undefined
    };
  }

  /**
   * Creates a shortened version of content
   */
  private createShortenedVersion(content: string, maxLength: number): string {
    if (content.length <= maxLength) return content;
    
    // Try to cut at sentence boundaries
    const sentences = content.split('. ');
    let shortened = '';
    
    for (const sentence of sentences) {
      if ((shortened + sentence + '. ').length <= maxLength) {
        shortened += (shortened ? '. ' : '') + sentence;
      } else {
        break;
      }
    }
    
    if (shortened.length === 0) {
      // If no complete sentence fits, truncate and add ellipsis
      shortened = content.substring(0, maxLength - 3) + '...';
    } else if (!shortened.endsWith('.')) {
      shortened += '.';
    }
    
    return shortened;
  }
}
