/**
 * AI Content Curation Types
 * 
 * This module defines the core types and interfaces for the intelligent
 * CV content curation system that can analyze full CVs and make smart
 * decisions about what content to include in targeted 1-page versions.
 */

import type { CVData } from '@dzb-cv/types';

/**
 * Represents a piece of content from the CV that can be analyzed and scored
 */
export interface ContentItem {
  /** Unique identifier for this content item */
  id: string;
  /** Type of content (experience, education, skill, achievement, etc.) */
  type: ContentType;
  /** The actual content text */
  content: string;
  /** Source section in the CV */
  section: string;
  /** Additional metadata about the content */
  metadata: ContentMetadata;
  /** Raw data from the original CV structure */
  rawData: any;
}

/**
 * Types of content that can be curated
 */
export enum ContentType {
  EXPERIENCE = 'experience',
  EDUCATION = 'education',
  SKILL = 'skill',
  ACHIEVEMENT = 'achievement',
  CERTIFICATION = 'certification',
  PROJECT = 'project',
  RESPONSIBILITY = 'responsibility',
  SUMMARY = 'summary',
  PERSONAL_INFO = 'personal_info'
}

/**
 * Metadata associated with each content item
 */
export interface ContentMetadata {
  /** When this content was created/achieved */
  dateRange?: {
    start: string;
    end?: string;
  };
  /** How recent this content is (impacts relevance) */
  recency: number; // 0-1 score
  /** Estimated impact/importance of this content */
  impact: number; // 0-1 score
  /** Length of the content in characters */
  length: number;
  /** Keywords extracted from this content */
  keywords: string[];
  /** Industry/sector relevance tags */
  sectors: string[];
}

/**
 * Job context information for content curation
 */
export interface JobContext {
  /** Job title */
  title: string;
  /** Industry/sector */
  sector: 'federal' | 'state' | 'private' | 'healthcare' | 'tech' | 'other';
  /** Job description text */
  description: string;
  /** Required skills */
  requiredSkills: string[];
  /** Required experience level */
  experienceLevel: string;
  /** Education requirements */
  educationRequirements: string[];
  /** Key responsibilities */
  responsibilities: string[];
  /** Company/organization info */
  organization: {
    name: string;
    type: string;
    size?: string;
  };
}

/**
 * Content scoring result
 */
export interface ContentScore {
  /** Content item being scored */
  contentId: string;
  /** Overall relevance score (0-1) */
  overallScore: number;
  /** Breakdown of scoring components */
  components: {
    /** How well keywords match job requirements */
    keywordRelevance: number;
    /** How well skills align with job needs */
    skillAlignment: number;
    /** How relevant the experience is */
    experienceRelevance: number;
    /** How recent/current the content is */
    recencyScore: number;
    /** Estimated impact/importance */
    impactScore: number;
    /** Sector-specific relevance */
    sectorRelevance: number;
  };
  /** Confidence in the score (0-1) */
  confidence: number;
  /** Explanation of why this score was assigned */
  reasoning: string[];
}

/**
 * Content selection decision
 */
export interface ContentDecision {
  /** Content item */
  contentId: string;
  /** Whether to include this content */
  include: boolean;
  /** Priority level if included */
  priority: 'critical' | 'high' | 'medium' | 'low';
  /** Reasoning for the decision */
  reasoning: string;
  /** Suggested modifications to the content */
  modifications?: {
    /** Suggested shortened version */
    shortened?: string;
    /** Keywords to emphasize */
    emphasize?: string[];
    /** Parts to remove */
    remove?: string[];
  };
}

/**
 * Curation strategy configuration
 */
export interface CurationStrategy {
  /** Name of the strategy */
  name: string;
  /** Target length constraints */
  constraints: {
    /** Maximum number of characters for entire CV */
    maxCharacters: number;
    /** Maximum number of experience items */
    maxExperienceItems: number;
    /** Maximum number of education items */
    maxEducationItems: number;
    /** Maximum number of skills */
    maxSkills: number;
  };
  /** Scoring weights for different components */
  weights: {
    keywordRelevance: number;
    skillAlignment: number;
    experienceRelevance: number;
    recencyScore: number;
    impactScore: number;
    sectorRelevance: number;
  };
  /** Sector-specific rules */
  sectorRules: Record<string, any>;
}

/**
 * Complete curation result
 */
export interface CurationResult {
  /** Selected content items */
  selectedContent: ContentDecision[];
  /** Content that was excluded */
  excludedContent: ContentDecision[];
  /** Overall curation strategy used */
  strategy: CurationStrategy;
  /** Summary statistics */
  summary: {
    /** Total original content items */
    originalItems: number;
    /** Number of items selected */
    selectedItems: number;
    /** Estimated character count of result */
    estimatedLength: number;
    /** Coverage of job requirements */
    requirementsCoverage: number;
  };
  /** Recommendations for improvement */
  recommendations: string[];
}

/**
 * AI Agent configuration
 */
export interface AIAgentConfig {
  /** Default curation strategy to use */
  defaultStrategy: CurationStrategy;
  /** Sector-specific strategies */
  sectorStrategies: Record<string, CurationStrategy>;
  /** Analysis settings */
  analysis: {
    /** Enable deep content analysis */
    enableDeepAnalysis: boolean;
    /** Use semantic similarity for content matching */
    useSemanticSimilarity: boolean;
    /** Include predictive relevance scoring */
    predictiveScoring: boolean;
  };
}

/**
 * Content analysis result
 */
export interface ContentAnalysis {
  /** All content items extracted from CV */
  contentItems: ContentItem[];
  /** Content scores against job context */
  scores: ContentScore[];
  /** Identified content clusters/themes */
  clusters: ContentCluster[];
  /** Overall CV analysis summary */
  summary: {
    totalItems: number;
    averageQuality: number;
    coverageAreas: string[];
    strengthAreas: string[];
    gapAreas: string[];
  };
}

/**
 * Content clustering for thematic grouping
 */
export interface ContentCluster {
  /** Cluster identifier */
  id: string;
  /** Theme/topic of the cluster */
  theme: string;
  /** Content items in this cluster */
  contentIds: string[];
  /** Relevance to job context */
  jobRelevance: number;
  /** Representative keywords */
  keywords: string[];
}
