/**
 * Academic CV specific types
 */

import type { CVData } from './cv-types.js';

/**
 * Academic award or recognition
 */
export interface Award {
  title: string;
  organization: string;
  year: string;
  description?: string;
  amount?: string;
  type?: 'research' | 'teaching' | 'service' | 'other';
}

/**
 * Academic publication
 */
export interface Publication {
  title: string;
  authors: string[];
  journal: string;
  year: string;
  volume: string;
  issue?: string;
  pages: string;
  doi?: string;
  status?: 'published' | 'in-press' | 'submitted' | 'in-preparation';
}

/**
 * Academic conference presentation
 */
export interface Conference {
  title: string;
  authors: string[];
  conferenceName: string;
  location: string;
  year: string;
  description?: string;
  type?: 'oral' | 'poster' | 'workshop' | 'keynote';
}

/**
 * Academic grant or funding
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
 * Academic CV data structure
 */
export interface AcademicCVData extends CVData {
  publications?: Publication[];
  conferences?: Conference[];
  grants?: Grant[];
  awards?: Award[];
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