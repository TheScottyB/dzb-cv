// Consolidated CV Types - Single Source of Truth
// @version 3.0

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
    /** @deprecated Use `address` instead */
    location?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  professionalTitle?: string;
  /** @deprecated Use `professionalTitle` instead */
  title?: string;
  summary?: string;
  citizenship?: string;
}

export interface Experience {
  position: string;
  /** @deprecated Use `position` instead */
  title?: string;
  employer: string;
  /** @deprecated Use `employer` instead */
  company?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  responsibilities: string[];
  description?: string;
  achievements?: string[];
  employmentType?: 'full-time' | 'part-time' | 'contract' | 'internship';
  /** @deprecated Use `employmentType` instead */
  employment_type?: string;
  gradeLevel?: string;
  /** @deprecated Use `gradeLevel` instead */
  grade_level?: string;
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
  graduationDate?: string;
  /** @deprecated Use `graduationDate` instead */
  year?: string;
  /** @deprecated Use `graduationDate` instead */
  completionDate?: string;
  location?: string;
  status?: string;
  notes?: string;
  gpa?: string;
  honors?: string[];
  courses?: string[];
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
  /** @deprecated Use `issuer` instead */
  institution?: string;
  date: string;
  /** @deprecated Use `date` instead */
  year?: string;
  url?: string;
  expirationDate?: string;
  /** @deprecated Use `expirationDate` instead */
  expiryDate?: string;
  status?: string;
  credentialId?: string;
}

export interface Project {
  name: string;
  description: string;
  technologies?: string[];
  url?: string;
  startDate?: string;
  endDate?: string;
  role?: string;
  organization?: string;
  achievements?: string[];
}

export interface Language {
  language: string;
  proficiency: string;
  certification?: string;
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

export interface Reference {
  name: string;
  title?: string;
  company?: string;
  relationship?: string;
  contact?: string;
  statement?: string;
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
  references?: Reference[];
  volunteerExperience?: Experience[];
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
