/**
 * Central Type Definitions
 * 
 * This file serves as a central location for type definitions used throughout the application.
 * It consolidates common types to ensure consistency and prevent duplication.
 */

// ===========================
// CV Generation Types
// ===========================

/**
 * Personal information section of a CV
 */
export interface PersonalInfo {
  name: {
    first: string;
    middle?: string;
    last: string;
    full: string;
  };
  contact: {
    email: string;
    phone: string;
    address?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  professionalTitle?: string;
  summary?: string;
  citizenship?: string;
  clearance?: string;
}

/**
 * Work experience entry
 */
export interface WorkExperience {
  employer: string;
  position: string;
  location?: string;
  startDate: string | Date;
  endDate?: string | Date;
  responsibilities: string[];
  achievements?: string[];
  technologies?: string[];
  isCurrent?: boolean;
  keywords?: string[];
}

/**
 * Education entry
 */
export interface Education {
  institution: string;
  location?: string;
  degree: string;
  field?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  gpa?: number;
  achievements?: string[];
  currentlyPursuing?: boolean;
}

/**
 * Skill entry
 */
export interface Skill {
  name: string;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsExperience?: number;
  description?: string;
}

/**
 * Certification entry
 */
export interface Certification {
  name: string;
  issuer: string;
  date: string | Date;
  expirationDate?: string | Date;
  identifier?: string;
}

/**
 * Complete CV data structure
 */
export interface CVData {
  personalInfo: PersonalInfo;
  professionalSummary?: string;
  coreCompetencies?: string[];
  experience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  certifications: Certification[];
  languages?: { name: string; proficiency: string }[];
  interests?: string[];
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Options for CV generation
 */
export interface CVGenerationOptions {
  format?: 'pdf' | 'markdown' | 'docx' | 'html';
  template?: string;
  filename?: string;
  includeHeaderFooter?: boolean;
  includeSummary?: boolean;
  maxExperienceEntries?: number;
  maxBulletPoints?: number;
  customSections?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * PDF generation options
 */
export interface PdfOptions {
  includeHeaderFooter?: boolean;
  headerText?: string;
  footerText?: string;
  paperSize?: 'Letter' | 'A4' | 'Legal';
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  pdfTitle?: string;
  pdfAuthor?: string;
  orientation?: 'portrait' | 'landscape';
}

// ===========================
// Job Analysis Types
// ===========================

/**
 * Job posting analysis result
 */
export interface JobPostingAnalysis {
  title: string;
  company: string;
  location?: string;
  description?: string;
  jobType?: string; 
  experienceLevel?: string;
  responsibilities: string[];
  qualifications: string[];
  keyTerms: string[];
  educationRequirements?: string[];
  salaryRange?: {
    min?: number;
    max?: number;
    period?: string;
  };
  source: {
    url: string;
    site: string;
    fetchDate: Date;
  };
}

/**
 * Options for job analysis
 */
export interface JobAnalyzerOptions {
  skipRateLimiting?: boolean;
  forceGenericParser?: boolean;
  maxRetries?: number;
  outputDir?: string;
  saveRawHtml?: boolean;
}

/**
 * CV match result against a job posting
 */
export interface CVMatchResult {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendedFocus: string[];
  matchedKeywords: Record<string, number>;
}

// ===========================
// Command Types
// ===========================

/**
 * Run configuration for tracking operations
 */
export interface RunConfiguration {
  jobPosting?: {
    url: string;
    content: string;
    timestamp: string;
  };
  verification?: {
    claims: VerifiedClaim[];
    sourceData: string;
  };
  outputs?: {
    cv?: string;
    coverLetter?: string;
    format?: string;
  };
}

/**
 * Interface for verified claims 
 */
export interface VerifiedClaim {
  content: string;
  sourceReference: {
    file: string;
    path: string[];
    context: string;
  };
}

/**
 * Sector type definition
 */
export type SectorType = 'federal' | 'state' | 'private';

// ===========================
// Profile Management Types
// ===========================

/**
 * Profile data structure
 */
export interface Profile {
  id: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
  versions: ProfileVersion[];
  currentVersion: ProfileVersion;
}

/**
 * Profile version
 */
export interface ProfileVersion {
  id: string;
  profileId: string;
  versionNumber: number;
  timestamp: string;
  data: CVData;
  createdBy?: string;
  previousVersionId?: string;
  changeReason?: string;
  importSourceId?: string;
  changes?: ProfileChange[];
}

/**
 * Profile change description
 */
export interface ProfileChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  resolutionNote?: string;
}

