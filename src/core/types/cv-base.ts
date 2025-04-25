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
export interface CVData {
  personalInfo: {
    name: {
      full: string;
      first?: string;
      last?: string;
    };
    title?: string;
    contact: {
      email: string;
      phone: string;
      address?: string;
    };
    citizenship?: string;
  };
  profiles?: {
    linkedIn?: string;
    github?: string;
    twitter?: string;
    website?: string;
    [key: string]: string | undefined;
  };
  professionalSummary?: string;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    field?: string;
    degreeType?: string;
    completionDate?: string;
    status?: string;
    notes?: string;
  }>;
  skills: string[];
  certifications: string[];
  professionalAffiliations?: Array<{
    organization: string;
    roles?: string[];
    activities?: string[];
  }>;
  volunteerWork?: Array<{
    organization?: string;
    year?: string;
    position?: string;
    responsibilities?: string[];
    activities?: string[];
    location?: string;
    duration?: string;
  }>;
  awards?: Array<{
    title: string;
    organization?: string;
    year?: string;
    notes?: string;
    achievement?: string;
    description?: string;
  }>;
  cvTypes?: {
    federal?: CVTypeConfiguration;
    state?: CVTypeConfiguration;
    private?: CVTypeConfiguration;
    [key: string]: CVTypeConfiguration | undefined;
  };
  experience: Array<Experience>;
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

