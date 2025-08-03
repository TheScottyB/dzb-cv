// Consolidated CV Types - Single Source of Truth
// @version 2.0

export interface Name {
  first: string;
  middle?: string;
  last: string;
  full: string;
}

export interface PersonalInfo {
  name: Name;
  contact: {
    email: string;
    phone: string;
    address?: string;
    location?: string; // Alias for address
    linkedin?: string;
    github?: string;
    website?: string;
  };
  professionalTitle?: string;
  title?: string; // Alias for professionalTitle
  summary?: string;
  citizenship?: string;
}

export interface Experience {
  position: string;
  title?: string; // Alias for position
  employer: string;
  company?: string; // Alias for employer
  startDate: string;
  endDate?: string;
  location?: string;
  responsibilities: string[];
  description?: string; // Single description alternative
  achievements?: string[];
  employmentType?: 'full-time' | 'part-time' | 'contract' | 'internship';
  employment_type?: string; // Legacy support
  grade_level?: string;
  gradeLevel?: string;
  salary?: string;
  supervisor?: string;
  mayContact?: boolean;
  careerProgression?: string[];
  period?: string;
}

export interface Education {
  institution: string;
  degree: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  graduationDate?: string; // Primary date field
  year?: string; // Simplified year format
  completionDate?: string; // Alternative completion date
  location?: string;
  status?: string;
  notes?: string;
  gpa?: string;
  honors?: string[];
  courses?: string[];
  // Support for certifications within education
  certification?: string;
}

export interface Skill {
  name: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | string;
  category?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  institution?: string; // Alias for issuer
  date: string;
  year?: string; // Simplified year format
  url?: string;
  expirationDate?: string;
  expiryDate?: string; // Alias for expirationDate
  status?: string;
}

export interface Project {
  name: string;
  description: string;
  technologies?: string[];
  url?: string;
  startDate?: string;
  endDate?: string;
}

export interface Language {
  language: string;
  proficiency: string;
}

export interface Publication {
  title: string;
  publisher?: string;
  journal?: string;
  date?: string;
  year?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  authors?: string;
}

// Main CV Data Interface - Comprehensive
export interface CVData {
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  certifications?: Certification[];
  projects?: Project[];
  languages?: Language[];
  publications?: Publication[];
  interests?: string[];
  metadata?: Record<string, unknown>;
}

// Template Interface
export interface CVTemplate {
  id: string;
  name: string;
  description?: string;
  getStyles?(): string;
  generateMarkdown(data: CVData, options?: any): string;
}

// Legacy type aliases for backward compatibility
export type ExperienceEntry = Experience;
export type EducationEntry = Education;
