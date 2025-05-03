/**
 * Base type definitions for CV data
 */

// Person name
export interface Name {
  first: string;
  last: string;
  full: string;
}

// Contact information
export interface ContactInfo {
  email: string;
  phone: string;
  address?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

// Personal information
export interface PersonalInfo {
  name: Name;
  title?: string;
  summary?: string;
  contact?: ContactInfo;
  citizenship?: string;
  profileImage?: string;
}

// Work experience
export interface Experience {
  id?: string;
  position: string;
  employer: string;
  company?: string; // Alias for employer, used in some templates
  title?: string; // Alias for position, used in some templates
  location?: string;
  department?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  achievements?: string[];
  responsibilities?: string[];
  skills?: string[];
  projects?: string[];
  careerProgression?: string[];
  period?: string; // Computed field for display
  mayContact?: boolean;
}

// Education
export interface Education {
  id?: string;
  institution: string;
  degree: string;
  field?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  year?: string; // Sometimes just the year is provided
  gpa?: string;
  honors?: string[];
  activities?: string[];
  description?: string;
}

// Skill
export interface Skill {
  name: string;
  level?: number | string;
  years?: number;
  category?: string;
}

// Certification
export interface Certification {
  name: string;
  issuer?: string;
  date?: string;
  expiration?: string;
  identifier?: string;
  url?: string;
}

// Publication for academic CVs
export interface Publication {
  title: string;
  authors: string;
  journal?: string;
  year: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  abstract?: string;
  citations?: number;
}

// Grant for academic CVs
export interface Grant {
  title: string;
  agency: string;
  year: string;
  amount?: string;
  role?: string;
  status?: string; // e.g., "Funded", "Pending", "Completed"
  description?: string;
}

// Award
export interface Award {
  title: string;
  organization: string;
  year: string;
  description?: string;
}

// Change tracking
export interface ProfileChange {
  id: string;
  timestamp: string;
  section: string;
  type: 'add' | 'update' | 'delete';
  details: string;
  resolutionNote?: string;
}

// Version for change tracking
export interface ProfileVersion {
  id: string;
  profileId: string;
  versionNumber: number;
  timestamp: string;
  createdBy: string;
  data: CVData;
  changes: string[] | ProfileChange[];
  description?: string;
}

// User profile
export interface Profile {
  id: string;
  owner: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  currentVersion: ProfileVersion;
  versions?: ProfileVersion[];
  userId?: string;
  data?: CVData;
}

// Main CV data type
export interface CVData {
  id?: string;
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  certifications?: Certification[];
  publications?: Publication[];
  grants?: Grant[];
  awards?: Award[];
  languages?: { language: string; proficiency: string }[];
  projects?: { name: string; description: string; url?: string; technologies?: string[] }[];
  references?: { name: string; position: string; company: string; contact: string }[];
  interests?: string[];
  additionalSections?: Record<string, any>;
  metadata?: {
    lastUpdated?: string;
    version?: string;
    template?: string;
    format?: string;
  };
}

// ATS-related types
export interface ATSIssue {
  type: string;
  message: string;
  fix?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  score?: number;
  examples?: string[];
}

export interface ATSImprovement {
  type: string;
  score: number;
  message: string;
  fix: string;
  examples: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface ATSAnalysisResult {
  score: number;
  maxScore: number;
  issues: ATSIssue[];
  improvements: ATSImprovement[];
}

// Academic CV specific type
export interface AcademicCVData extends CVData {
  teachingExperience?: Experience[];
  researchExperience?: Experience[];
  serviceProfessional?: {
    title: string;
    organization: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }[];
  presentations?: {
    title: string;
    venue: string;
    date: string;
    type: string;
    description?: string;
  }[];
  memberships?: {
    organization: string;
    role?: string;
    startDate?: string;
    endDate?: string;
  }[];
  funding?: Grant[];
}

