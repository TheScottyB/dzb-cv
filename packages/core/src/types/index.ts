/**
 * Central type definition exports for the CV generation system
 * 
 * This file exports all type definitions used throughout the project,
 * serving as the single entry point for importing types.
 */

// Basic CV data structures
export * from './cv-base';

// Core CV Types
export {
  // Re-export core interfaces from cv-base to ensure they're available
  CVItem,
  CVCategory,
  CVDataItem,
  BaseCVData,
  Name,
  Address,
  SocialLink,
  PersonalInfo,
  Experience,
  Reference,
  Language,
  Project,
  Publication,
  Award,
  Volunteer,
  Education,
  Skill,
  Certification,
  PDFGenerationOptions,
  CVGenerationOptions
} from './cv-base';

// CV Types extensions
export type CVData = BaseCVData;

// Academic CV specific types
export interface AcademicCVData extends BaseCVData {
  /** List of academic positions held */
  positions?: Experience[];
  /** Academic education history */
  education?: Education[];
  /** List of academic publications */
  publications?: Publication[];
  /** List of grants and funding received */
  grants?: any[];
  /** List of awards and honors */
  awards?: Award[];
  /** List of teaching experience */
  teaching?: any[];
  /** List of service activities */
  service?: any[];
  /** List of professional memberships */
  memberships?: any[];
  /** List of invited talks */
  invitedTalks?: any[];
  /** List of conference presentations */
  conferencePresentations?: any[];
  /** Custom fields for academic institutions */
  institution?: {
    name: string;
    department?: string;
    website?: string;
    logo?: string;
  };
  /** Optional field for teaching philosophy */
  teachingPhilosophy?: string;
  /** Optional field for research interests */
  researchInterests?: string[];
  /** Optional field for research statement */
  researchStatement?: string;
  /** Optional field for diversity statement */
  diversityStatement?: string;
}

// Template-related types
export interface TemplateOptions {
  name: string;
  format: 'pdf' | 'docx' | 'html' | 'md';
  version?: string;
  includeHeaderFooter?: boolean;
  headerText?: string;
  footerText?: string;
  paperSize?: 'Letter' | 'A4' | 'Legal';
  style?: {
    font?: string;
    fontSize?: number;
    spacing?: number;
    margins?: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    colors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
    };
  };
  margins?: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  pdfTitle?: string;
  pdfAuthor?: string;
  orientation?: 'portrait' | 'landscape';
  fontFamily?: string;
  sections?: {
    order: string[];
    hide?: string[];
    custom?: Record<string, unknown>;
  };
  header?: {
    includePhoto?: boolean;
    style?: 'minimal' | 'standard' | 'detailed';
  };
  footer?: {
    includePageNumbers?: boolean;
    customText?: string;
  };
  metadata?: Record<string, unknown>;
}

// Academic Template specific options
export interface AcademicTemplateOptions extends TemplateOptions {
  /** Include publication abstracts */
  includeAbstracts?: boolean;
  /** Sort publications by date (newest first) */
  sortPublicationsByDate?: boolean;
  /** Include citation metrics */
  includeCitationMetrics?: boolean;
  /** Include DOI links for publications */
  includeDOILinks?: boolean;
  /** Group publications by type */
  groupPublicationsByType?: boolean;
  /** Include full course descriptions */
  includeFullCourseDescriptions?: boolean;
  /** Include contact information on first page */
  includeContactInformation?: boolean;
  /** Institution-specific formatting requirements */
  institutionRequirements?: {
    /** Institution name or identifier */
    institution: string;
    /** Specific formatting rules */
    rules: string[];
    /** Required sections */
    requiredSections?: string[];
    /** Prohibited sections */
    prohibitedSections?: string[];
  };
  /** Publication format style */
  citationStyle?: 'apa' | 'mla' | 'chicago' | 'harvard' | 'ieee' | string;
}

export interface CVTemplate {
  name: string;
  getStyles(): string;
  generate(data: CVData, options?: TemplateOptions): string;
  generateHeader(data: CVData, options?: TemplateOptions): string;
}

export interface TemplateContext {
  data: CVData;
  options: TemplateOptions;
  helpers?: Record<string, Function>;
  partials?: Record<string, string>;
}

export interface TemplateResult {
  content: Buffer;
  metadata: {
    format: string;
    timestamp: string;
    template: string;
    pageCount?: number;
    fileSize?: number;
  };
  warnings?: string[];
}

export abstract class BaseTemplate implements CVTemplate {
  abstract name: string;
  abstract getStyles(): string;
  abstract generate(data: CVData, options?: TemplateOptions): string;
  generateHeader(data: CVData, options?: TemplateOptions): string {
    // Default implementation that can be overridden
    return '';
  }
}

// Utility and configuration types
export * from './config';
export * from './storage';
export * from './validation';

// Core configuration
export interface CoreConfig {
  rootDir: string;
  outputDir: string;
  templatesDir: string;
}
