import { CVData } from './cv-base.js';

/**
 * Publication entry for academic CV
 */
export interface Publication {
  title: string;
  authors: string;
  journal: string;
  year: string;
  volume: string;
  issue?: string;
  pages: string;
  doi?: string;
  status?: 'published' | 'in-press' | 'submitted' | 'in-preparation';
}

/**
 * Conference presentation entry for academic CV
 */
export interface Conference {
  title: string;
  authors: string;
  conferenceName: string;
  location: string;
  year: string;
  description?: string;
  type?: 'oral' | 'poster' | 'workshop' | 'keynote';
}

/**
 * Grant or funding entry for academic CV
 */
export interface Grant {
  title: string;
  agency: string;
  amount: string;
  year: string;
  description?: string;
  status?: 'active' | 'completed' | 'pending';
  role?: string;
  duration?: string;
}

/**
 * Academic-specific CV data extending the base CVData
 */
export interface AcademicCVData extends CVData {
  publications?: Publication[];
  conferences?: Conference[];
  grants?: Grant[];
  teachingExperience?: {
    courses: Array<{
      title: string;
      code: string;
      level: 'undergraduate' | 'graduate';
      semester: string;
      year: string;
      description?: string;
    }>;
    supervision: Array<{
      type: 'phd' | 'masters' | 'undergraduate' | 'postdoc';
      name: string;
      title: string;
      status: 'current' | 'completed';
      year?: string;
    }>;
  };
  researchInterests?: string[];
  academicService?: Array<{
    role: string;
    organization: string;
    period: string;
    description?: string;
  }>;
}

