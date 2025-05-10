/**
 * Module for integrating with external ATS APIs and services
 */
import { ATSAnalysisResult, ATSIssue, ATSIssueType, ATSIssueCategory } from './scoring.js';

/**
 * Interface for configuring the external API client
 */
export interface JobBoardAPIOptions {
  apiKey: string;
  baseUrl: string;
  timeout?: number; // Optional custom timeout
}

/**
 * Structure of a job listing returned from the API
 */
export interface JobListingResponse {
  title: string;
  description: string;
  requirements: string[];
  qualifications: string[];
  skills: string[];
  company: string;
  location: string;
  postDate: string;
  closingDate?: string;
}

/**
 * Structure of a resume analysis returned from external ATS
 */
export interface ExternalATSAnalysisResponse {
  score: number;
  feedback: string[];
  keywords: string[];
  missingKeywords: string[];
  compatibilityScore: number;
  format: {
    isValid: boolean;
    issues: Array<{
      type: string;
      category: string;
      message: string;
      fix: string;
      score: number;
      detected: string;
    }>;
  };
  content: {
    isValid: boolean;
    issues: Array<{
      type: string;
      category: string;
      message: string;
      fix: string;
      score: number;
      detected: string;
    }>;
  };
}

/**
 * Custom error class for ATS API errors
 */
export class ATSApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ATSApiError';
  }
}

/**
 * Client for interacting with external ATS APIs
 */
export class ATSApiClient {
  private options: Required<JobBoardAPIOptions>;

  constructor(options: JobBoardAPIOptions) {
    this.options = {
      timeout: 30000, // Default timeout of 30 seconds
      ...options,
    };
  }

  /**
   * Makes an authenticated request to the API
   * @param endpoint API endpoint path
   * @param method HTTP method
   * @param body Optional request body
   */
  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    body?: unknown
  ): Promise<T> {
    try {
      const response = await fetch(`${this.options.baseUrl}${endpoint}`, {
        method,
        headers: {
          Authorization: `Bearer ${this.options.apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: body ? JSON.stringify(body) : null,
        signal: AbortSignal.timeout(this.options.timeout),
      });

      if (!response.ok) {
        throw new ATSApiError(
          `API request failed: ${response.statusText}`,
          response.status,
          await response.json().catch(() => null)
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof ATSApiError) {
        throw error;
      }
      throw new ATSApiError(error instanceof Error ? error.message : 'Unknown API error');
    }
  }

  /**
   * Fetches job listing data from API
   * @param jobId Job listing ID
   */
  async getJobListing(jobId: string): Promise<JobListingResponse> {
    return this.makeRequest<JobListingResponse>(`/jobs/${jobId}`);
  }

  /**
   * Analyzes resume against a specific job listing
   * @param resumeData Resume file data (base64 encoded)
   * @param jobId Job listing ID
   */
  async analyzeResumeForJob(
    resumeData: string,
    jobId: string
  ): Promise<ExternalATSAnalysisResponse> {
    return this.makeRequest<ExternalATSAnalysisResponse>('/analyze', 'POST', {
      resume: resumeData,
      jobId,
    });
  }

  /**
   * Extracts keywords from a job description
   * @param jobDescription Full text of job description
   */
  async extractKeywords(jobDescription: string): Promise<string[]> {
    const result = await this.makeRequest<{ keywords: string[] }>('/keywords/extract', 'POST', {
      text: jobDescription,
    });
    return result.keywords;
  }

  /**
   * Maps external issue category to internal ATSIssueType
   */
  private mapExternalIssueType(issueType: string): ATSIssueType {
    switch (issueType.toLowerCase()) {
      case 'format':
        return ATSIssueType.COMPLEX_FORMATTING;
      case 'content':
        return ATSIssueType.MISSING_KEYWORDS;
      default:
        return ATSIssueType.SPECIAL_CHARS;
    }
  }

  /**
   * Maps external issue to internal ATSIssueCategory
   */
  private mapExternalIssueCategory(issueType: string): ATSIssueCategory {
    switch (issueType.toLowerCase()) {
      case 'format':
        return ATSIssueCategory.HIGH;
      case 'content':
        return ATSIssueCategory.MEDIUM;
      default:
        return ATSIssueCategory.LOW;
    }
  }

  /**
   * Converts an external ATS analysis to our internal format
   * @param externalAnalysis Analysis result from external API
   */
  convertExternalAnalysis(
    externalAnalysis: ExternalATSAnalysisResponse
  ): Partial<ATSAnalysisResult> {
    const formatIssues: ATSIssue[] = externalAnalysis.format.issues.map((issue) => ({
      type: issue.type as ATSIssueType,
      category: issue.category as ATSIssueCategory,
      message: issue.message,
      fix: issue.fix,
      impact: issue.score,
      location: issue.detected,
    }));

    const contentIssues: ATSIssue[] = externalAnalysis.content.issues.map((issue) => ({
      type: issue.type as ATSIssueType,
      category: issue.category as ATSIssueCategory,
      message: issue.message,
      fix: issue.fix,
      impact: issue.score,
      location: issue.detected,
    }));

    return {
      score: externalAnalysis.score,
      parseRate: externalAnalysis.compatibilityScore,
      keywords: {
        found: externalAnalysis.keywords,
        missing: externalAnalysis.missingKeywords,
        relevanceScore: externalAnalysis.compatibilityScore,
      },
      issues: [...formatIssues, ...contentIssues],
      recommendation: externalAnalysis.feedback.join(' '),
    };
  }

  /**
   * Returns a list of popular ATS systems
   */
  async getPopularATSSystems(): Promise<string[]> {
    return [
      'Workday',
      'iCIMS',
      'Lever',
      'Greenhouse',
      'Jobvite',
      'ADP Recruiting',
      'SmartRecruiters',
    ];
  }
}

/**
 * Creates a new ATS API client with the given configuration
 * @param options API client configuration
 */
export function createATSApiClient(options: JobBoardAPIOptions): ATSApiClient {
  return new ATSApiClient(options);
}
