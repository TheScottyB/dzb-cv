export interface WorkExperience {
  company: string;
  position: string;
  startDate: string;
  endDate: string | 'Present';
  description: string;
  achievements: string[];
  location?: string;
  hoursPerWeek?: number; // For federal applications
  salary?: string; // For federal applications
  supervisor?: {
    name: string;
    contact?: string;
  };
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string | 'Present';
  location?: string;
  achievements?: string[];
  gpa?: number;
}

export interface Skill {
  name: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  years?: number;
}

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
  };
  profiles: {
    linkedIn?: string;
    github?: string;
    website?: string;
    other?: Record<string, string>;
  };
  summary?: string;
  workExperience?: WorkExperience[];
  education?: Education[];
  skills?: Skill[];
  certifications?: {
    name: string;
    issuer: string;
    date: string;
    expiryDate?: string;
  }[];
  languages?: {
    language: string;
    proficiency: string;
  }[];
  awards?: {
    name: string;
    issuer: string;
    date: string;
    description?: string;
  }[];
  cvTypes: {
    federal: {
      requirements: string[];
      format: string;
    };
    state: {
      requirements: string[];
      format: string;
    };
    private: {
      requirements: string[];
      format: string;
    };
  };
}

/**
 * Information about a salary range from a job posting
 */
export interface SalaryRange {
  min?: number;
  max?: number;
  currency?: string;
  period?: string; // yearly, monthly, hourly
}

/**
 * Source information for a job posting
 */
export interface JobSource {
  url: string;
  site: string; // LinkedIn, Indeed, etc.
  fetchDate: Date;
}

/**
 * Complete analysis of a job posting
 * Contains structured information extracted from job listings
 * that can be used to tailor CVs for specific applications
 */
export interface JobPostingAnalysis {
  title: string;
  company: string;
  location?: string;
  jobType?: string; // Full-time, part-time, contract, etc.
  experienceLevel?: string;
  requiredSkills: string[];
  desiredSkills?: string[];
  responsibilities: string[];
  qualifications: string[];
  educationRequirements?: string[];
  keyTerms: string[]; // Important terms/keywords from the job posting
  source: JobSource;
  salaryRange?: SalaryRange;
}
