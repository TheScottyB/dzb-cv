/**
 * Represents salary information for a job posting
 * @interface Salary
 */
export interface Salary {
  /** Minimum salary amount */
  min?: number;
  /** Maximum salary amount */
  max?: number;
  /** Currency code (e.g., USD, EUR) */
  currency?: string;
  /** Payment period */
  period?: 'hourly' | 'monthly' | 'yearly';
}

/**
 * Represents contact information for a job posting
 * @interface ContactInfo
 */
export interface ContactInfo {
  /** Contact person's name */
  name?: string;
  /** Contact email address */
  email?: string;
  /** Contact phone number */
  phone?: string;
}

/**
 * Core job posting data structure
 * @interface JobPosting
 */
export interface JobPosting {
  /** Unique identifier for the job */
  jobId?: string | number;
  /** Job posting URL */
  url: string;
  /** Job title */
  title: string;
  /** Company name */
  company: string;
  /** Job location */
  location?: string;
  /** Full job description */
  description: string;
  /** Required qualifications */
  qualifications?: string[];
  /** Job responsibilities */
  responsibilities?: string[];
  /** Required skills */
  skills?: string[];
  /** Education requirements */
  education?: string[];
  /** Experience requirements */
  experience?: string[];
  /** Company benefits */
  benefits?: string[];
  /** Salary information */
  salary?: Salary;
  /** Type of employment */
  employmentType?: 'full-time' | 'part-time' | 'contract' | 'temporary' | 'internship';
  /** Date job was posted */
  postedDate?: string;
  /** Application closing date */
  closingDate?: string;
  /** Department or team */
  department?: string;
  /** Contact information */
  contactInfo?: ContactInfo;
  /** Source of the job posting */
  source?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}
