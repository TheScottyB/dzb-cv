/**
 * Intelligent Content Selection Agent
 * 
 * This is the core AI agent that orchestrates content analysis, scoring, ranking,
 * and selection to make intelligent decisions about what content to include in
 * a 1-page CV based on job requirements.
 */

import type { CVData } from '@dzb-cv/types';
import type {
  JobContext,
  CurationResult,
  CurationStrategy,
  AIAgentConfig,
  ContentAnalysis
} from '../types/curation.js';

import { ContentAnalyzer } from '../analysis/content-analyzer.js';
import { JobAlignmentScorer } from '../scoring/job-alignment-scorer.js';
import { ContentRanker } from '../ranking/content-ranker.js';

/**
 * The main AI Content Curator Agent
 */
export class ContentCurator {
  private contentAnalyzer: ContentAnalyzer;
  private alignmentScorer: JobAlignmentScorer;
  private contentRanker: ContentRanker;
  private config: AIAgentConfig;

  constructor(config: AIAgentConfig) {
    this.config = config;
    this.contentAnalyzer = new ContentAnalyzer();
    this.alignmentScorer = new JobAlignmentScorer();
    this.contentRanker = new ContentRanker(config.defaultStrategy);
  }

  /**
   * Main curation method - analyzes CV and curates content for 1-page version
   */
  public async curateCV(
    cv: CVData,
    jobContext: JobContext,
    customStrategy?: CurationStrategy
  ): Promise<CurationResult> {
    // Step 1: Analyze the full CV content
    console.log('🔍 Analyzing CV content...');
    const contentAnalysis = await this.contentAnalyzer.analyzeCV(cv, jobContext);

    // Step 2: Score content items against job requirements
    console.log('📊 Scoring content alignment with job requirements...');
    const contentScores = this.alignmentScorer.scoreContentItems(
      contentAnalysis.contentItems,
      jobContext
    );

    // Update analysis with scores
    contentAnalysis.scores = contentScores;

    // Step 3: Select appropriate curation strategy
    const strategy = customStrategy || this.selectStrategy(jobContext);
    console.log(`🎯 Using ${strategy.name} curation strategy for ${jobContext.sector} sector`);

    // Step 4: Rank content based on relevance and strategic importance
    console.log('🏆 Ranking content by strategic importance...');
    const ranker = new ContentRanker(strategy);
    const rankedItems = ranker.rankContent(
      contentAnalysis.contentItems,
      contentScores,
      jobContext
    );

    // Step 5: Make content selection decisions
    console.log('🤖 Making intelligent content selection decisions...');
    const contentDecisions = ranker.createContentDecisions(rankedItems, jobContext);

    // Step 6: Generate curation result
    const result = this.generateCurationResult(
      contentDecisions,
      strategy,
      contentAnalysis,
      jobContext
    );

    // Step 7: Validate and optimize result
    const optimizedResult = await this.optimizeResult(result, jobContext);

    console.log('✅ Content curation completed successfully');
    this.logCurationSummary(optimizedResult);

    return optimizedResult;
  }

  /**
   * Selects the most appropriate curation strategy based on job context
   */
  private selectStrategy(jobContext: JobContext): CurationStrategy {
    // Check if we have a sector-specific strategy
    const sectorStrategy = this.config.sectorStrategies[jobContext.sector];
    if (sectorStrategy) {
      return sectorStrategy;
    }

    // Use default strategy with sector-specific adjustments
    const baseStrategy = { ...this.config.defaultStrategy };
    
    // Adjust strategy based on sector
    switch (jobContext.sector) {
      case 'federal':
        // Federal applications often need more detailed experience
        baseStrategy.constraints.maxExperienceItems = Math.min(
          baseStrategy.constraints.maxExperienceItems + 1,
          4
        );
        baseStrategy.weights.experienceRelevance += 0.1;
        break;

      case 'healthcare':
        // Healthcare emphasizes certifications and recent experience
        baseStrategy.weights.sectorRelevance += 0.1;
        baseStrategy.weights.recencyScore += 0.05;
        break;

      case 'tech':
        // Tech sector values skills and projects
        baseStrategy.constraints.maxSkills = Math.min(
          baseStrategy.constraints.maxSkills + 2,
          10
        );
        baseStrategy.weights.skillAlignment += 0.1;
        break;

      default:
        // Keep default strategy for private/other sectors
        break;
    }

    return baseStrategy;
  }

  /**
   * Generates the final curation result
   */
  private generateCurationResult(
    contentDecisions: any[],
    strategy: CurationStrategy,
    analysis: ContentAnalysis,
    jobContext: JobContext
  ): CurationResult {
    const selectedContent = contentDecisions.filter(d => d.include);
    const excludedContent = contentDecisions.filter(d => !d.include);

    // Calculate estimated length
    const estimatedLength = selectedContent.reduce((total, decision) => {
      const item = analysis.contentItems.find(item => item.id === decision.contentId);
      return total + (item?.metadata.length || 0);
    }, 0);

    // Calculate requirements coverage
    const requirementsCoverage = this.calculateRequirementsCoverage(
      selectedContent,
      analysis.contentItems,
      jobContext
    );

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      selectedContent,
      excludedContent,
      analysis,
      jobContext
    );

    return {
      selectedContent,
      excludedContent,
      strategy,
      summary: {
        originalItems: analysis.contentItems.length,
        selectedItems: selectedContent.length,
        estimatedLength,
        requirementsCoverage
      },
      recommendations
    };
  }

  /**
   * Calculates how well the selected content covers job requirements
   */
  private calculateRequirementsCoverage(
    selectedContent: any[],
    allContentItems: any[],
    jobContext: JobContext
  ): number {
    const selectedItems = selectedContent.map(decision => 
      allContentItems.find(item => item.id === decision.contentId)
    ).filter(Boolean);

    const allKeywords = selectedItems.flatMap(item => 
      item.metadata.keywords.map((k: string) => k.toLowerCase())
    );

    const requiredKeywords = [
      ...jobContext.requiredSkills.map(s => s.toLowerCase()),
      ...jobContext.responsibilities.flatMap(r => r.toLowerCase().split(' ')),
    ].filter(k => k.length > 2);

    const matches = requiredKeywords.filter(keyword => 
      allKeywords.some(ck => ck.includes(keyword) || keyword.includes(ck))
    );

    return matches.length / Math.max(requiredKeywords.length, 1);
  }

  /**
   * Generates recommendations for improving the curation
   */
  private generateRecommendations(
    selectedContent: any[],
    excludedContent: any[],
    analysis: ContentAnalysis,
    jobContext: JobContext
  ): string[] {
    const recommendations: string[] = [];

    // Check for missing critical skills
    const selectedSkills = selectedContent
      .map(decision => analysis.contentItems.find(item => item.id === decision.contentId))
      .filter(item => item?.type === 'skill')
      .map(item => item?.content.toLowerCase());

    const missingCriticalSkills = jobContext.requiredSkills.filter(
      skill => !selectedSkills.includes(skill.toLowerCase())
    );

    if (missingCriticalSkills.length > 0) {
      recommendations.push(
        `Consider adding these missing critical skills: ${missingCriticalSkills.join(', ')}`
      );
    }

    // Check content balance
    const contentTypeCount = selectedContent.reduce((counts, decision) => {
      const item = analysis.contentItems.find(item => item.id === decision.contentId);
      if (item) {
        counts[item.type] = (counts[item.type] || 0) + 1;
      }
      return counts;
    }, {} as Record<string, number>);

    if ((contentTypeCount.experience || 0) < 2) {
      recommendations.push('Consider including more relevant work experience');
    }

    if ((contentTypeCount.achievement || 0) === 0) {
      recommendations.push('Include quantifiable achievements to strengthen your CV');
    }

    // Check for highly ranked excluded content
    const highValueExcluded = excludedContent.filter(decision => 
      decision.priority === 'high' || decision.priority === 'critical'
    );

    if (highValueExcluded.length > 0) {
      recommendations.push(
        'Some high-value content was excluded due to space constraints. Consider shortening other sections.'
      );
    }

    return recommendations;
  }

  /**
   * Optimizes the curation result
   */
  private async optimizeResult(
    result: CurationResult,
    jobContext: JobContext
  ): Promise<CurationResult> {
    // Check if we can fit more high-priority excluded content
    const availableSpace = result.strategy.constraints.maxCharacters - result.summary.estimatedLength;
    
    if (availableSpace > 100) {
      const highPriorityExcluded = result.excludedContent
        .filter(decision => decision.priority === 'high')
        .sort((a, b) => {
          // Sort by potential value (this would need access to scores)
          return 0; // Simplified for now
        });

      // Try to fit some high-priority excluded content
      for (const decision of highPriorityExcluded.slice(0, 2)) {
        if (decision.modifications?.shortened) {
          const shortenedLength = decision.modifications.shortened.length;
          if (shortenedLength <= availableSpace) {
            // Move from excluded to selected
            result.excludedContent = result.excludedContent.filter(d => d.contentId !== decision.contentId);
            result.selectedContent.push({
              ...decision,
              include: true,
              reasoning: 'Included after optimization with shortened version'
            });
            
            result.summary.selectedItems++;
            result.summary.estimatedLength += shortenedLength;
            break;
          }
        }
      }
    }

    return result;
  }

  /**
   * Logs a summary of the curation process
   */
  private logCurationSummary(result: CurationResult): void {
    console.log('\n📋 Curation Summary:');
    console.log(`   Original items: ${result.summary.originalItems}`);
    console.log(`   Selected items: ${result.summary.selectedItems}`);
    console.log(`   Estimated length: ${result.summary.estimatedLength} characters`);
    console.log(`   Requirements coverage: ${(result.summary.requirementsCoverage * 100).toFixed(1)}%`);
    
    if (result.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      result.recommendations.forEach(rec => console.log(`   • ${rec}`));
    }
  }

  /**
   * Creates a curated CV markdown from the curation result
   */
  public async generateCuratedMarkdown(
    originalCV: CVData,
    curationResult: CurationResult
  ): Promise<string> {
    const selectedItems = curationResult.selectedContent;
    const allContentItems = []; // Would need to pass this from the analysis
    
    // This is a simplified implementation
    // In a full implementation, this would reconstruct the CV structure
    // based on selected content with proper formatting
    
    let markdown = '# Curated CV\n\n';
    
    // Group selected content by type
    const contentByType = selectedItems.reduce((groups, decision) => {
      // Find the original content item
      const item = allContentItems.find(item => item.id === decision.contentId);
      if (item) {
        if (!groups[item.type]) groups[item.type] = [];
        groups[item.type].push({
          decision,
          item
        });
      }
      return groups;
    }, {} as Record<string, any[]>);

    // Build markdown sections
    if (contentByType.summary) {
      markdown += '## Professional Summary\n\n';
      contentByType.summary.forEach(({ decision, item }) => {
        const content = decision.modifications?.shortened || item.content;
        markdown += `${content}\n\n`;
      });
    }

    if (contentByType.experience) {
      markdown += '## Experience\n\n';
      contentByType.experience.forEach(({ decision, item }) => {
        const content = decision.modifications?.shortened || item.content;
        markdown += `### ${content}\n\n`;
      });
    }

    // Add other sections similarly...

    return markdown;
  }
}

/**
 * Default AI Agent Configuration
 */
export const defaultAIConfig: AIAgentConfig = {
  defaultStrategy: {
    name: 'Standard Single-Page',
    constraints: {
      maxCharacters: 4000,
      maxExperienceItems: 3,
      maxEducationItems: 2,
      maxSkills: 8
    },
    weights: {
      keywordRelevance: 0.3,
      skillAlignment: 0.2,
      experienceRelevance: 0.2,
      recencyScore: 0.1,
      impactScore: 0.1,
      sectorRelevance: 0.1
    },
    sectorRules: {}
  },
  sectorStrategies: {
    federal: {
      name: 'Federal Application',
      constraints: {
        maxCharacters: 4500,
        maxExperienceItems: 4,
        maxEducationItems: 3,
        maxSkills: 6
      },
      weights: {
        keywordRelevance: 0.25,
        skillAlignment: 0.15,
        experienceRelevance: 0.35,
        recencyScore: 0.1,
        impactScore: 0.1,
        sectorRelevance: 0.05
      },
      sectorRules: {
        requireDetailedExperience: true,
        emphasizeClearances: true
      }
    },
    healthcare: {
      name: 'Healthcare Application',
      constraints: {
        maxCharacters: 3800,
        maxExperienceItems: 3,
        maxEducationItems: 2,
        maxSkills: 10
      },
      weights: {
        keywordRelevance: 0.3,
        skillAlignment: 0.25,
        experienceRelevance: 0.2,
        recencyScore: 0.15,
        impactScore: 0.05,
        sectorRelevance: 0.05
      },
      sectorRules: {
        emphasizeCertifications: true,
        requireRecentExperience: true
      }
    },
    tech: {
      name: 'Technology Application',
      constraints: {
        maxCharacters: 4200,
        maxExperienceItems: 3,
        maxEducationItems: 2,
        maxSkills: 12
      },
      weights: {
        keywordRelevance: 0.35,
        skillAlignment: 0.3,
        experienceRelevance: 0.15,
        recencyScore: 0.1,
        impactScore: 0.05,
        sectorRelevance: 0.05
      },
      sectorRules: {
        emphasizeProjects: true,
        techStackImportant: true
      }
    }
  },
  analysis: {
    enableDeepAnalysis: true,
    useSemanticSimilarity: false, // Could be enhanced with NLP libraries
    predictiveScoring: false
  }
};
