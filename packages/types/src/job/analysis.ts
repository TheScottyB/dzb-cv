/**
 * Options for job posting analysis
 * @interface JobAnalysisOptions
 */
export interface JobAnalysisOptions {
  /** Skip rate limiting during analysis */
  skipRateLimiting?: boolean;
  /** Force use of generic parser */
  forceGenericParser?: boolean;
  /** Maximum number of key terms to extract */
  maxKeyTerms?: number;
  /** Include education requirement analysis */
  includeEducation?: boolean;
  /** Perform detailed analysis */
  detailedAnalysis?: boolean;
}

/**
 * Detailed analysis of a job posting
 * @interface JobPostingAnalysis
 */
export interface JobPostingAnalysis {
  /** Analyzed job title */
  title: string;
  /** Company name */
  company: string;
  /** Job location */
  location?: string;
  /** Processed job description */
  description?: string;
  /** Extracted responsibilities */
  responsibilities: string[];
  /** Required qualifications */
  qualifications: string[];
  /** Key terms from the posting */
  keyTerms: string[];
  /** Type of job */
  jobType?: string;
  /** Required experience level */
  experienceLevel?: string;
  /** Analyzed salary range */
  salaryRange?: {
    min?: number;
    max?: number;
    period?: string;
  };
  /** Required education levels */
  educationRequirements?: string[];
  /** Source information */
  source: {
    url: string;
    site: string;
    fetchDate: Date;
  };
}

/**
 * Result of matching a CV against a job posting
 * @interface CVMatchResult
 */
export interface CVMatchResult {
  /** Overall match score */
  score: number;
  /** Keywords found in the CV */
  matchedKeywords: string[];
  /** Required keywords missing from CV */
  missingKeywords: string[];
  /** Suggested improvements */
  suggestedImprovements: string[];
  /** Matched qualifications */
  matchedQualifications: string[];
  /** Matched responsibilities */
  matchedResponsibilities: string[];
  /** Overall match assessment */
  overallMatch: 'high' | 'medium' | 'low';
  /** Full job posting analysis */
  jobAnalysis: JobPostingAnalysis;
}
