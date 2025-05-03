/**
 * @deprecated Import from packages/core/src/types/cv-base.ts instead
 */
import { CVData as BaseCVData } from '../../../packages/core/src/types/cv-base';

export type CVData = BaseCVData;
  professionalSummary?: string;
  experience: Array<{
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate?: string;
    responsibilities: string[];
    achievements?: string[];
    employment_type?:
      | 'full-time'
      | 'part-time'
      | 'contract'
      | 'internship'
      | 'academic'
      | 'government';
    grade_level?: string; // For government positions
  }>;
  education: Array<{
    degree: string;
    institution: string;
    location?: string;
    year: string;
    gpa?: string;
    honors?: string[];
    courses?: string[];
  }>;
  skills: string[];
  certifications: string[];
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
  languages?: Array<{
    name: string;
    proficiency: 'native' | 'fluent' | 'professional' | 'intermediate' | 'basic';
  }>;
  volunteer?: Array<{
    organization: string;
    role: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
}
