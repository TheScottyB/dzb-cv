/**
 * Core CV data structures and interfaces
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

export interface Experience {
  employer: string;
  position: string;
  startDate: string;
  endDate?: string;
  location?: string;
  responsibilities: string[];
  employmentType: string;
  supervisor?: string;
  achievements?: string[];
  gradeLevel?: string;
  salary?: string;
  careerProgression?: string[];
  technologies?: string[];
  isCurrent?: boolean;
  keywords?: string[];
  period?: string;
  duties?: string[];
  address?: string;
  hours?: string;
  mayContact?: boolean;
}

export interface Education {
  institution: string;
  location?: string;
  degree: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  gpa?: number;
  achievements?: string[];
  currentlyPursuing?: boolean;
  courses?: string[];
  honors?: string[];
}
export interface Skill {
  name: string;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsExperience?: number;
  description?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date: string | Date;
  expirationDate?: string | Date;
  identifier?: string;
}

export interface Publication {
  title: string;
  publisher: string;
  date: string;
  url?: string;
  description?: string;
  authors?: string[];
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  year?: string;
}

export interface Award {
  name: string;
  issuer: string;
  date: string;
  description?: string;
}

export interface Project {
  name: string;
  description: string;
  technologies?: string[];
  url?: string;
  startDate?: string;
  endDate?: string;
}

export interface Volunteer {
  organization: string;
  role: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface Language {
  name: string;
  proficiency: 'native' | 'fluent' | 'professional' | 'intermediate' | 'basic';
}
export interface CVData {
  personalInfo: PersonalInfo;
  professionalSummary?: string;
  coreCompetencies?: string[];
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  certifications: Certification[];
  languages?: Language[];
  interests?: string[];
  projects?: Project[];
  publications?: Publication[];
  awards?: Award[];
  volunteer?: Volunteer[];
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}
export interface CVTypeConfiguration {
  requirements?: string[];
  format?: string;
  emphasizedExperience?: string[];
  additionalDetails?: Record<string, unknown>;
  highlights?: string[];
}
