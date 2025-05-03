/**
 * Extended CV data structures not included in base CV types
 */

/**
 * Represents a project in a CV portfolio
 */
export interface Project {
  /** Project name */
  name: string;
  /** Description of the project */
  description: string;
  /** Technologies used in the project */
  technologies?: string[];
  /** URL to the project website or repository */
  url?: string;
  /** Start date of the project */
  startDate?: string;
  /** End date of the project, or "Present" if ongoing */
  endDate?: string;
  /** Role in the project */
  role?: string;
  /** Associated organization or client */
  organization?: string;
  /** Project outcome or achievements */
  achievements?: string[];
}

/**
 * Represents language proficiency
 */
export interface Language {
  /** Language name */
  language: string;
  /** Proficiency level e.g. "Native", "Fluent", "Intermediate", "Beginner" */
  proficiency: string;
  /** Optional certification level or formal assessment */
  certification?: string;
}

/**
 * Represents a professional certification
 */
export interface Certification {
  /** Name of the certification */
  name: string;
  /** Organization that issued the certification */
  issuer: string;
  /** Date when certification was obtained */
  date: string;
  /** URL to verification page */
  url?: string;
  /** Expiration date if applicable */
  expirationDate?: string;
  /** Certification ID or credential ID */
  credentialId?: string;
}

/**
 * Interface for references/recommendations
 */
export interface Reference {
  /** Name of the reference */
  name: string;
  /** Title/position of the reference */
  title?: string;
  /** Company/organization of the reference */
  company?: string;
  /** Relationship to the reference */
  relationship?: string;
  /** Contact information */
  contact?: string;
  /** Reference statement/quote */
  statement?: string;
}

/**
 * Extended CV data structures not included in base CV types
 */
import { Experience } from './base.js';
export interface ExtendedCVData {
  /** Portfolio projects */
  projects?: Project[];
  /** Language proficiency */
  languages?: Language[];
  /** Professional certifications */
  certifications?: Certification[];
  /** Professional references */
  references?: Reference[];
  /** Volunteer experience */
  volunteerExperience?: Array<Omit<Experience, 'employmentType'>>;
}

