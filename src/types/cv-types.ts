/**
 * Core CV data structure
 */
export interface CVData {
  personalInfo: {
    name: {
      full: string;
      preferred: string;
    };
    contact: {
      email: string;
      phone: string;
      address?: string;
    };
    citizenship?: string;
  };
  profiles?: {
    linkedIn?: string;
    github?: string;
    twitter?: string;
    website?: string;
    [key: string]: string | undefined;
  };
  professionalSummary?: string;
  education?: Array<{
    certification?: string;
    institution?: string;
    year?: string;
    field?: string;
    degree_type?: string;
    completion_date?: string;
    status?: string;
    notes?: string;
  }>;
  skills?: {
    technical?: string[];
    managementAndLeadership?: string[];
    realEstateOperations?: string[];
    healthcareAdministration?: string[];
    certifications?: string[];
    realEstateCertifications?: string[];
    leadership?: string[];
    [key: string]: string[] | undefined;
  };
  professionalAffiliations?: Array<{
    organization: string;
    roles?: string[];
    activities?: string[];
  }>;
  workExperience?: {
    healthcare?: Experience[];
    realEstate?: Experience[];
    foodIndustry?: Experience[];
    [key: string]: Experience[] | undefined;
  };
  volunteerWork?: Array<{
    organization?: string;
    year?: string;
    position?: string;
    duties?: string[];
    activities?: string[];
    location?: string;
    while?: string;
  }>;
  awards?: Array<{
    title: string;
    organization?: string;
    period?: string;
    notes?: string;
    achievement?: string;
    description?: string;
  }>;
  cvTypes?: {
    federal?: CVTypeConfiguration;
    state?: CVTypeConfiguration;
    private?: CVTypeConfiguration;
    [key: string]: CVTypeConfiguration | undefined;
  };
}

/**
 * Experience entry structure for work history
 */
export interface Experience {
  employer: string;
  position: string;
  period: string;
  address?: string;
  location?: string;
  duties?: string[];
  hours?: string;
  employment_type?: string;
  employmentType?: string;
  supervisor?: string;
  mayContact?: boolean;
  achievements?: string[];
  grade_level?: string;
  salary?: string;
  career_progression?: string[];
}

/**
 * CV type-specific configuration
 */
export interface CVTypeConfiguration {
  requirements?: string[];
  format?: string;
  emphasizedExperience?: string[];
  additionalDetails?: Record<string, unknown>;
  highlights?: string[];
}

/**
 * PDF generation options
 */
export interface PDFOptions {
  paperSize: 'Letter' | 'A4' | 'Legal';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  fontFamily?: string;
  fontSize?: number;
  includeHeaderFooter?: boolean;
  headerText?: string;
  footerText?: string;
  pdfTitle?: string;
  pdfAuthor?: string;
  pdfCreator?: string;
  orientation?: 'portrait' | 'landscape';
  cssStylesheet?: string;
}

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
  location?: string;
  jobType?: string;
  experienceLevel?: string;
  responsibilities: string[];
  qualifications: string[];
  educationRequirements?: string[];
  keyTerms: string[];
  salaryRange?: {
    min?: number;
    max?: number;
    period?: string;
  };
  sourceSite: string;
  sourceUrl: string;
  analyzedAt: string;
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
 * Template rendering options
 */
export interface TemplateOptions {
  includePersonalInfo?: boolean;
  includeProfessionalSummary?: boolean;
  includeEducation?: boolean;
  includeSkills?: boolean;
  includeExperience?: boolean;
  includeVolunteerWork?: boolean;
  includeAwards?: boolean;
  includeAffiliations?: boolean;
  customSections?: Array<{
    title: string;
    content: string;
  }>;
  experienceOrder?: string[];
  experienceFilter?: (exp: Experience) => boolean;
  customFooter?: string;
  customHeader?: string;
}

/**
 * CV Generation options for both markdown and PDF
 */
export interface CVGenerationOptions {
  format: 'markdown' | 'pdf';
  pdfOptions?: Partial<PDFOptions>;
  filename?: string;
  templateOptions?: TemplateOptions;
  jobAnalysis?: JobPostingAnalysis;
}
