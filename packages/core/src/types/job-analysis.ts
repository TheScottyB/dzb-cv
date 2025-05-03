/**
 * Job posting and analysis types
 */

/**
 * Represents a job posting with detailed information
 * 
 * @property url - URL of the job posting
 * @property title - Job title
 * @property company - Company name
 * @property location - Job location
 * @property description - Full job description
 * @property responsibilities - List of job responsibilities
 * @property qualifications - List of required qualifications
 * @property htmlPath - Path to saved HTML file
 * @property screenshotPath - Path to screenshot of the job posting
 * @property metadata - Additional metadata about the job posting
 * @property jobType - Type of job (full-time, part-time, contract, etc.)
 * @property salary - Salary information
 * @property benefits - List of benefits
 * @property remote - Whether the job is remote
 * @property travelRequired - Whether travel is required
 * @property clearanceRequired - Security clearance requirements
 */
export interface JobPosting {
  url: string;
  title: string;
  company: string;
  location: string;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  htmlPath: string;
  screenshotPath: string;
  metadata?: {
    url: string;
    source: string;
    id: string;
    postedDate: string;
    expiryDate: string | null;
  };
  jobType?: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
    period?: string;
  };
  benefits?: string[];
  remote?: boolean;
  travelRequired?: boolean;
  clearanceRequired?: string;
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

/**
 * Options for job processing operations
 *
 * @property maxRetries - Maximum number of retries for failed operations
 * @property retryDelay - Delay between retries in milliseconds
 * @property timeout - Operation timeout in milliseconds
 * @property outputDir - Directory to save output files
 * @property saveRawHtml - Whether to save raw HTML
 * @property saveScreenshot - Whether to save screenshots
 */
export interface JobProcessorOptions {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  outputDir?: string;
  saveRawHtml?: boolean;
  saveScreenshot?: boolean;
}

/**
 * Result of matching a CV against a job posting
 *
 * @property score - Overall match score (0-100)
 * @property matchedSkills - Skills that match job requirements
 * @property missingSkills - Skills from job requirements not found in CV
 * @property recommendedFocus - Areas to focus on for improvement
 * @property matchedKeywords - Keywords that matched with frequency count
 * @property analysis - Detailed analysis of match by category
 * @property suggestions - Suggestions for improving match
 */
export interface JobMatchResult {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendedFocus: string[];
  matchedKeywords: Record<string, number>;
  analysis: {
    skillsMatch: number;
    experienceMatch: number;
    educationMatch: number;
    overallFit: 'high' | 'medium' | 'low';
  };
  suggestions: {
    skills: string[];
    experience: string[];
    education: string[];
    general: string[];
  };
}

