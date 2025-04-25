/**
 * Core CV data structure
 */
export interface CVData {
  personalInfo: {
    name: {
      full: string;
      first?: string;
      last?: string;
    };
    title?: string;
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
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    field?: string;
    degree_type?: string;
    completion_date?: string;
    status?: string;
    notes?: string;
  }>;
  skills: string[];
  certifications: string[];
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
  experience: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    responsibilities: string[];
  }>;
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
  employmentType: string;
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
  includeHeaderFooter: boolean;
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
  fontFamily?: string;
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
  location?: string | undefined;
  description?: string | undefined;
  responsibilities: string[];
  qualifications: string[];
  keyTerms: string[];
  jobType?: string | undefined;
  experienceLevel?: string | undefined;
  salaryRange?: {
    min?: number | undefined;
    max?: number | undefined;
    period?: string | undefined;
  } | undefined;
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
}
