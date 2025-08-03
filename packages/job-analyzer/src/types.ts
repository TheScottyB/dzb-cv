// Job Analyzer Types
// @version 1.0

export enum JobSite {
  LINKEDIN = 'linkedin',
  INDEED = 'indeed',
  USAJOBS = 'usajobs',
  MONSTER = 'monster',
  GLASSDOOR = 'glassdoor',
  GENERIC = 'generic'
}

export interface RateLimitConfig {
  requestsPerMinute: number;
  lastRequestTime: number;
  minTimeBetweenRequests: number;
  maxRetries: number;
  retryDelay: number;
}

export interface JobPostingData {
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  qualifications: string[];
  benefits?: string[];
  salary?: string;
  jobType?: string;
  experienceLevel?: string;
  url: string;
  postedDate?: string;
  closingDate?: string;
  raw?: {
    html: string;
    extractedText: string;
  };
}

export interface ParsedJobContent {
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  qualifications: string[];
  benefits: string[];
  skills: string[];
  keywords: string[];
  metadata: {
    jobSite: JobSite;
    url: string;
    extractedAt: Date;
    parseStrategy: string;
  };
}

export interface JobAnalysisResult {
  success: boolean;
  data?: ParsedJobContent;
  error?: {
    message: string;
    type: string;
    details?: Record<string, unknown>;
  };
  metrics: {
    fetchTime: number;
    parseTime: number;
    totalTime: number;
    retries: number;
  };
}

export interface SiteParsingStrategy {
  selectors: {
    title: string;
    company: string;
    location: string;
    description: string;
    requirements?: string;
    qualifications?: string;
    benefits?: string;
    salary?: string;
  };
  preprocessing?: {
    removeElements?: string[];
    cleanupRules?: string[];
  };
  postprocessing?: {
    titleCleanup?: RegExp[];
    descriptionFilters?: RegExp[];
  };
}

export interface FetchOptions {
  timeout?: number;
  retries?: number;
  userAgent?: string;
  headers?: Record<string, string>;
  followRedirects?: boolean;
}

export interface ParsingOptions {
  strategy?: string;
  extractSkills?: boolean;
  extractKeywords?: boolean;
  minDescriptionLength?: number;
  includeRawData?: boolean;
}