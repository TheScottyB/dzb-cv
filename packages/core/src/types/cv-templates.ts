/**
 * Template system type definitions for CV generation
 * 
 * This file defines all template-related types used throughout the project
 * and should be the single source of truth for these definitions.
 */
import type { CVData } from './cv-base.js';

/**
 * Configuration options for CV template generation
 */
export interface TemplateOptions {
  /** Template name */
  name?: string;
  /** Output format for the template */
  format?: 'pdf' | 'docx' | 'html' | 'md';
  /** Template version */
  version?: string;
  /** Whether to include header and footer */
  includeHeaderFooter?: boolean;
  /** Text to include in the header */
  headerText?: string;
  /** Text to include in the footer */
  footerText?: string;
  /** Paper size for PDF generation */
  paperSize?: 'Letter' | 'A4' | 'Legal';
  /** Page orientation */
  orientation?: 'portrait' | 'landscape';
  /** Styling options */
  style?: {
    /** Font family */
    font?: string;
    /** Font size in points */
    fontSize?: number;
    /** Line spacing */
    spacing?: number;
    /** Page margins in points or millimeters */
    margins?: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    /** Color scheme */
    colors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
    };
  };
  /** Section configuration */
  sections?: {
    /** Order of sections in the CV */
    order: string[];
    /** Sections to hide */
    hide?: string[];
    /** Custom section settings */
    custom?: Record<string, unknown>;
  };
  /** Header configuration */
  header?: {
    /** Whether to include a photo */
    includePhoto?: boolean;
    /** Header style */
    style?: 'minimal' | 'standard' | 'detailed';
  };
  /** Footer configuration */
  footer?: {
    /** Whether to include page numbers */
    includePageNumbers?: boolean;
    /** Custom text for the footer */
    customText?: string;
  };
  /** PDF document metadata */
  metadata?: Record<string, unknown>;
  /** PDF title metadata */
  pdfTitle?: string;
  /** PDF author metadata */
  pdfAuthor?: string;
}

/**
 * Template rendering context with data and options
 */
export interface TemplateContext {
  /** CV data to be rendered */
  data: CVData;
  /** Template configuration options */
  options: TemplateOptions;
  /** Helper functions available to the template */
  helpers?: Record<string, Function>;
  /** Partial templates for reuse */
  partials?: Record<string, string>;
}

/**
 * Result of template rendering
 */
export interface TemplateResult {
  /** Generated document content */
  content: Buffer;
  /** Metadata about the generated document */
  metadata: {
    /** Output format */
    format: string;
    /** Generation timestamp */
    timestamp: string;
    /** Template used */
    template: string;
    /** Number of pages */
    pageCount?: number;
    /** File size in bytes */
    fileSize?: number;
  };
  /** Any warning messages generated during rendering */
  warnings?: string[];
}

/**
 * Interface for CV template implementations
 */
export interface CVTemplate {
  /** Template name */
  name: string;
  /** Get CSS styles for the template */
  getStyles(): string;
  /** Generate the CV content */
  generate(data: CVData, options?: TemplateOptions): string;
  /** Generate the header content */
  generateHeader(data: CVData, options?: TemplateOptions): string;
}

/**
 * Base template implementation with common functionality
 */
export abstract class BaseTemplate implements CVTemplate {
  /** Template name */
  abstract name: string;
  /** Get CSS styles for the template */
  abstract getStyles(): string;
  /** Generate the CV content */
  abstract generate(data: CVData, options?: TemplateOptions): string;
  /** Generate the header content with default implementation */
  generateHeader(data: CVData, options?: TemplateOptions): string {
    // Default implementation that can be overridden
    return '';
  }
}

/**
 * Academic template specific options
 */
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
