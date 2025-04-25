/**
 * Unified resume analysis engine combining ML parsing and ATS API integration
 */
import { ATSApiClient, JobBoardAPIOptions } from './api.js';
import { MLResumeParser, MLParserOptions, ParsedResume, MLAnalysisResult } from './ml-parser.js';
import { ATSAnalysisResult } from './scoring.js';

export interface ResumeAnalysisOptions {
  ml?: MLParserOptions;
  api?: JobBoardAPIOptions;
}

export interface ResumeAnalysisResult {
  parsed: ParsedResume;
  mlAnalysis: MLAnalysisResult;
  atsAnalysis?: ATSAnalysisResult;
  combinedScore: number;
  suggestions: string[];
}

/**
 * Unified engine for resume analysis combining ML parsing and ATS API integration
 */
export class ResumeAnalysisEngine {
  private mlParser: MLResumeParser;
  private atsApiClient?: ATSApiClient;

  constructor(options: ResumeAnalysisOptions = {}) {
    this.mlParser = new MLResumeParser(options.ml);
    if (options.api) {
      this.atsApiClient = new ATSApiClient(options.api);
    }
  }

  /**
   * Analyzes a resume file with optional job description matching
   * @param buffer Resume file buffer
   * @param mimeType File MIME type
   * @param jobId Optional job listing ID for ATS analysis
   */
  async analyzeResume(
    buffer: Buffer,
    mimeType: string,
    jobId?: string
  ): Promise<ResumeAnalysisResult> {
    // Parse resume using ML parser
    const parsed = await this.mlParser.parseResume(buffer, mimeType);

    let jobDescription: string | undefined;
    let atsAnalysis: ATSAnalysisResult | undefined;

    // If job ID is provided and we have an API client, get job details
    if (jobId && this.atsApiClient) {
      try {
        const jobListing = await this.atsApiClient.getJobListing(jobId);
        jobDescription = jobListing.description;

        // Get ATS analysis from external API
        const externalAnalysis = await this.atsApiClient.analyzeResumeForJob(
          buffer.toString('base64'),
          jobId
        );
        atsAnalysis = this.atsApiClient.convertExternalAnalysis(externalAnalysis);
      } catch (error) {
        console.error('Failed to get job details or ATS analysis:', error);
      }
    }

    // Get ML analysis
    const mlAnalysis = await this.mlParser.analyzeResume(
      parsed,
      jobDescription ?? ''
    );

    // Combine suggestions from both analyses
    const suggestions = [
      ...mlAnalysis.suggestions,
      ...(atsAnalysis?.issues.map(issue => issue.fix) ?? [])
    ];

    // Calculate combined score
    const combinedScore = this.calculateCombinedScore(mlAnalysis, atsAnalysis);

    return {
      parsed,
      mlAnalysis,
      atsAnalysis,
      combinedScore,
      suggestions: [...new Set(suggestions)] // Remove duplicates
    };
  }

  /**
   * Calculates a combined score from ML and ATS analyses
   */
  private calculateCombinedScore(
    mlAnalysis: MLAnalysisResult,
    atsAnalysis?: ATSAnalysisResult
  ): number {
    if (!atsAnalysis) {
      return mlAnalysis.overallMatch;
    }

    // Weight ML analysis more heavily as it's more detailed
    return (mlAnalysis.overallMatch * 0.6 + atsAnalysis.score * 0.4);
  }

  /**
   * Checks if the engine has API integration configured
   */
  hasApiIntegration(): boolean {
    return !!this.atsApiClient;
  }

  /**
   * Updates API configuration
   * @param options New API configuration
   */
  updateApiConfig(options: JobBoardAPIOptions): void {
    this.atsApiClient = new ATSApiClient(options);
  }

  /**
   * Updates ML parser configuration
   * @param options New ML parser configuration
   */
  updateMlConfig(options: MLParserOptions): void {
    this.mlParser = new MLResumeParser(options);
  }
} 