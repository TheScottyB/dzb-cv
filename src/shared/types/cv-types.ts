/**
 * @deprecated Import from @dzb-cv/core/types instead
 */
import {
  CVData as BaseCVData,
  Experience as BaseExperience,
  CVTypeConfiguration as BaseCVTypeConfiguration,
  PDFGenerationOptions as BasePDFOptions,
  TemplateOptions as BaseTemplateOptions,
  CVGenerationOptions as BaseCVGenerationOptions,
} from '@dzb-cv/core/types';

export type CVData = BaseCVData;

/**
 * @deprecated Import from @dzb-cv/core/types instead
 */
export type Experience = BaseExperience;

/**
 * @deprecated Import from @dzb-cv/core/types instead
 */
export type CVTypeConfiguration = BaseCVTypeConfiguration;

/**
 * @deprecated Use PDFGenerationOptions from @dzb-cv/core/types instead
 */
export type PDFOptions = BasePDFOptions;

/**
 * Job posting analysis interfaces
 */
export interface JobPosting {
  url: string;
  title: string;
  company: string;
  location?: string;
  description: string;
  requirements?: string;
  qualifications?: string;
  responsibilities?: string;
  datePosted?: string;
  jobType?: string;
  salary?: string;
  source: string;
}

export interface JobPostingAnalysis {
  title: string;
  company: string;
  location?: string | undefined;
  description?: string | undefined;
  responsibilities: string[];
  qualifications: string[];
  keyTerms: string[];
  jobType?: string | undefined;
  experienceLevel?: string | undefined;
  salaryRange?:
    | {
        min?: number | undefined;
        max?: number | undefined;
        period?: string | undefined;
      }
    | undefined;
  educationRequirements?: string[] | undefined;
  source: {
    url: string;
    site: string;
    fetchDate: Date;
  };
}

export interface JobAnalysisOptions {
  skipRateLimiting?: boolean;
  forceGenericParser?: boolean;
  maxKeyTerms?: number;
  includeEducation?: boolean;
  detailedAnalysis?: boolean;
}

/**
 * CV-Job matching types
 */
export interface CVMatchResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestedImprovements: string[];
  matchedQualifications: string[];
  matchedResponsibilities: string[];
  overallMatch: 'high' | 'medium' | 'low';
  jobAnalysis: JobPostingAnalysis;
}

/**
/**
 * @deprecated Use TemplateOptions from @dzb-cv/core/types instead
 */
export type TemplateOptions = BaseTemplateOptions;

/**
 * @deprecated Use CVGenerationOptions from @dzb-cv/core/types instead
 */
export type CVGenerationOptions = BaseCVGenerationOptions;
