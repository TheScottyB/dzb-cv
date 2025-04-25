// Generic work experience
export interface WorkExperience {
  employer: string;
  position: string;
  period: string;
  responsibilities: string[];
  address?: string | undefined;
  hours?: string | undefined;
  supervisor?: string | undefined;
  mayContact?: boolean | undefined;
}

// Skills breakdown by category
export interface Skills {
  healthcareAdministration: string[];
  managementAndLeadership: string[];
  technical: string[];
  certifications: string[];
}

// Personal information structure

export interface PersonalInfo {
  name: {
    full: string;
    preferred: string;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
  };
}

// Education + optional metadata
export interface EducationEntry {
  certification: string;
  institution?: string;
  year?: string;
}

// Base information from applicant profile
export interface BaseInfo {
  personalInfo: PersonalInfo;
  professionalSummary: string;
  workExperience: {
    healthcare: WorkExperience[];
    realEstate: WorkExperience[];
    foodIndustry: WorkExperience[];
  };
  education: EducationEntry[];
  skills: Skills;
}

// Parsed job data for tailoring purposes
export interface JobData {
  position: string;
  employer: string;
  location: string;
  education: string[];
  experience: string[];
  certifications: string[];
  skills: string[];
  responsibilities: string[];
  realExperience: WorkExperience[];
}

// Final output passed to CV generator & ATS analyzer
export interface ATSContent {
  title: string;
  company: string;
  location: string;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  skills: string[];
  education: Array<{
    certification: string;
    institution?: string;
    year?: string;
  }>;
  experience: string[];
  metadata: {
    source: string;
    url: string;
    date: string;
  };
}

interface ATSIssue {
  type: 'missing' | 'mismatch' | 'format' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high';
  suggestion?: string | undefined;
}

// Output from ATS compatibility analysis
export interface ATSAnalysis {
  score: number;
  improvements: string[];
  issues: ATSIssue[];
  warnings: string[];
}
