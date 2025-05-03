// Add missing types and ensure consistency
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
}

export interface Experience {
  position: string;
  employer: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  responsibilities: string[];
  achievements?: string[];
  skills?: string[];
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
  completionDate?: string;
  status?: string;
  notes?: string;
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
  authors: string[];
  journal?: string;
  publisher: string;
  year: string;
  date: string;
  volume?: string;
  issue?: string;
  pages?: string;
  url?: string;
  description?: string;
}

export interface Award {
  title: string;
  name: string;
  issuer: string;
  date: string;
  year?: string;
  organization?: string;
  description?: string;
}

export interface CVData {
  personalInfo: PersonalInfo;
  experience?: Experience[];
  education?: Education[];
  skills?: Skill[];
  certifications?: Certification[];
  publications?: Publication[];
  awards?: Award[];
  languages?: { name: string; proficiency: string }[];
  interests?: string[];
  references?: { name: string; title: string; contact: string }[];
}

export interface AcademicCVData extends CVData {
  teaching?: {
    institution: string;
    position: string;
    dates: string;
    description?: string;
  }[];
  research?: {
    title: string;
    institution: string;
    dates: string;
    description: string;
  }[];
  grants?: {
    title: string;
    funder: string;
    amount: string;
    dates: string;
    role: string;
  }[];
  publications?: Publication[];
  presentations?: {
    title: string;
    venue: string;
    date: string;
    type: string;
  }[];
}

/**
 * Core Curriculum Vitae (CV) data structures and interfaces
 * 
 * This module defines the fundamental types used throughout the CV generation system.
 * All types follow a consistent naming convention:
 * - PascalCase for interface names
 * - camelCase for properties
 * - Consistent use of optional properties
 * - Consistent use of Array<T> syntax
 */

/**
 * Represents a work experience entry in a CV
 * 
 * @property employer - Name of the employing organization
 * @property position - Job title or position held
 * @property startDate - Start date of employment (ISO format or MM/YYYY)
 * @property endDate - End date of employment (ISO format, MM/YYYY, or 'Present')
 * @property location - Physical location of employment
 * @property responsibilities - List of job responsibilities and achievements
 * @property employmentType - Type of employment (e.g., 'full-time', 'contract')
 * @property supervisor - Name of direct supervisor (optional)
 * @property achievements - Notable achievements during employment
 * @property gradeLevel - Government grade level (for federal positions)
 * @property salary - Compensation information (optional)
 * @property careerProgression - Career advancement details
 * @property technologies - Technologies used in this role
 * @property isCurrent - Whether this is the current position
 * @property keywords - Keywords relevant to this experience
 * @property period - Legacy format period string (e.g., "2020-2023")
 * @property duties - Legacy format duties list
 * @property address - Physical address of employment
 * @property hours - Working hours
 * @property mayContact - Whether supervisor may be contacted
 */
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

/**
 * Core data structure representing a complete CV
 * 
 * @property personalInfo - Personal and contact information
 * @property professionalSummary - Brief professional overview
 * @property education - Educational background
 * @property experience - Work experience history
 * @property skills - Professional skills and competencies
 * @property certifications - Professional certifications
 * @property professionalAffiliations - Professional memberships
 * @property volunteerWork - Volunteer experience
 * @property awards - Professional awards and recognition
 * @property cvTypes - CV type-specific configurations
 */
/**
 * Core data structure representing a complete CV
 * 
 * @property personalInfo - Personal and contact information
 * @property professionalSummary - Brief professional overview
 * @property coreCompetencies - Core professional competencies
 * @property experience - Work experience history
 * @property education - Educational background
 * @property skills - Professional skills and competencies
 * @property certifications - Professional certifications
 * @property languages - Language proficiencies
 * @property interests - Personal or professional interests
 * @property metadata - Additional structured data
 */
export interface CVData {
  personalInfo: {
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
  };
  professionalSummary?: string;
  coreCompetencies?: string[];
  experience: Array<Experience>;
  education: Array<{
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
  }>;
  skills: Array<{
    name: string;
    category?: string;
    level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    yearsExperience?: number;
    description?: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string | Date;
    expirationDate?: string | Date;
    identifier?: string;
  }>;
  languages?: Array<{
    name: string;
    proficiency: 'native' | 'fluent' | 'professional' | 'intermediate' | 'basic';
  }>;
  interests?: string[];
  projects?: Array<{
    name: string;
    description: string;
    technologies?: string[];
    url?: string;
    startDate?: string;
    endDate?: string;
  }>;
  publications?: Array<{
    title: string;
    publisher: string;
    date: string;
    url?: string;
    description?: string;
  }>;
  awards?: Array<{
    name: string;
    issuer: string;
    date: string;
    description?: string;
  }>;
  volunteer?: Array<{
    organization: string;
    role: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Configuration for specific CV types (e.g., federal, academic)
 * 
 * @property requirements - Specific requirements for the CV type
 * @property format - Formatting specifications
 * @property emphasizedExperience - Experience types to emphasize
 * @property additionalDetails - Type-specific additional information
 * @property highlights - Key points to highlight
 */
export interface CVTypeConfiguration {
  requirements?: string[];
  format?: string;
  emphasizedExperience?: string[];
  additionalDetails?: Record<string, unknown>;
  highlights?: string[];
}

