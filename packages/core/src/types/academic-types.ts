import type { 
  CVData, 
  Experience, 
  Publication, 
  Award, 
  Grant, 
  AcademicCVData as BaseAcademicCVData 
} from '@dzb-cv/common';

// Re-export the AcademicCVData from common
export type { AcademicCVData } from '@dzb-cv/common';

/**
 * Core-specific validation rules for academic CVs
 */
export interface AcademicCVValidationRules {
  requirePublications?: boolean;
  requireGrants?: boolean;
  requireTeachingExperience?: boolean;
  requireResearchExperience?: boolean;
  minimumPublications?: number;
  minimumGrants?: number;
  validateCitations?: boolean;
}

/**
 * Academic publication with enhanced metadata for the core package
 */
export interface AcademicPublication extends Publication {
  type?: 'journal' | 'conference' | 'book' | 'chapter' | 'thesis' | 'other';
  status?: 'published' | 'in press' | 'under review' | 'in preparation';
  impactFactor?: number;
  peerReviewed?: boolean;
  openAccess?: boolean;
}

/**
 * Conference presentation data for academic CVs
 */
export interface Conference {
  title: string;
  authors: string;
  conferenceName: string;
  location: string;
  year: string;
  type?: 'poster' | 'oral' | 'panel' | 'workshop';
  abstract?: string;
  url?: string;
}

/**
 * Academic teaching experience data
 */
export interface TeachingExperience {
  course: string;
  institution: string;
  position?: string;
  role?: string;
  level?: string;
  startDate?: string;
  endDate?: string;
  period?: string;
  current?: boolean;
  description?: string;
  evaluations?: {
    score?: string | number;
    scale?: string;
    respondents?: number;
    totalStudents?: number;
    categories?: Array<{
      name: string;
      score: string | number;
      comments?: string[];
    }>;
    comments?: string[];
    period?: string;
    url?: string;
  };
}

/**
 * Academic service such as committee work, peer review, editorial roles
 */
export interface AcademicService {
  role: string;
  organization: string;
  startDate?: string;
  endDate?: string;
  period?: string;
  description?: string;
  type?: 'committee' | 'review' | 'editorial' | 'mentoring' | 'outreach' | 'administration' | string;
  level?: 'department' | 'faculty' | 'institution' | 'national' | 'international' | string;
  url?: string;
  impact?: string;
  recognition?: string;
}

/**
 * Academic thesis or dissertation supervised
 */
export interface Thesis {
  type: string;
  title: string;
  student: string;
  supervisor: string;
  year: string;
  institution?: string;
  status?: 'completed' | 'in progress' | string;
  description?: string;
  url?: string;
}

/**
 * Enhanced academic CV data structure with core-specific fields
 */
export interface EnhancedAcademicCVData extends BaseAcademicCVData {
  academicPublications?: AcademicPublication[];
  conferences?: Conference[];
  teachingExperience?: TeachingExperience[];
  academicService?: AcademicService[];
  researchInterests?: string[];
  theses?: Thesis[];
  coursesDeveloped?: Array<{
    title: string;
    code?: string;
    institution?: string;
    year?: string;
    description?: string;
    level?: 'undergraduate' | 'graduate' | 'professional' | string;
  }>;
  researchMetrics?: {
    hIndex?: number;
    citations?: number;
    source?: string;
    url?: string;
    lastUpdated?: string;
  };
  fieldwork?: Array<{
    title: string;
    location: string;
    period?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    outcomes?: string[];
  }>;
}
