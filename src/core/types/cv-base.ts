/**
 * Core CV data structures
 */

// Move the Experience interface first as it's used by CVData
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
 * CV type-specific configuration
 */
export interface CVTypeConfiguration {
  requirements?: string[];
  format?: string;
  emphasizedExperience?: string[];
  additionalDetails?: Record<string, unknown>;
  highlights?: string[];
}

