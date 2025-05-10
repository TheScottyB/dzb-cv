/**
 * Job posting and analysis types
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
  location?: string;
  description?: string;
  responsibilities: string[];
  qualifications: string[];
  keyTerms: string[];
  jobType?: string;
  experienceLevel?: string;
  salaryRange?: {
    min?: number;
    max?: number;
    period?: string;
  };
  educationRequirements?: string[];
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
