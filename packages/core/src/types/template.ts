/**
 * Template options for customizing CV generation
 */

/**
 * Paper size options for templates
 */
export type PaperSize = 'Letter' | 'A4' | 'Legal';

/**
 * Layout options for templates
 */
export interface LayoutOptions {
  sectionOrder?: string[];
  columns?: 1 | 2;
  header?: 'minimal' | 'standard' | 'prominent';
  spacing?: 'compact' | 'standard' | 'comfortable';
}

export interface TemplateOptions {
  /**
   * Template identifier
   */
  id: string;
  /**
   * Display name for the template
   */
  name: string;
  /**
   * Brief description of the template style
   */
  description?: string;
  /**
   * Path to template preview image
   */
  previewImage?: string;
  /**
   * Supported output formats
   */
  supportedFormats: ('pdf' | 'docx' | 'html')[];
  /**
   * Section visibility options
   */
  includePersonalInfo?: boolean;
  includeExperience?: boolean;
  includeEducation?: boolean;
  includeSkills?: boolean;
  includeProjects?: boolean;
  includePublications?: boolean;
  includeCertifications?: boolean;
  includeLanguages?: boolean;
  includeVolunteer?: boolean;
  includeAwards?: boolean;
  includeReferences?: boolean;
  /**
   * @deprecated Use direct section visibility flags instead
   */
  sections?: {
    includePersonalInfo?: boolean;
    includeExperience?: boolean;
    includeEducation?: boolean;
    includeSkills?: boolean;
    includeProjects?: boolean;
    includePublications?: boolean;
    includeCertifications?: boolean;
    includeLanguages?: boolean;
    includeVolunteer?: boolean;
    includeAwards?: boolean;
    includeReferences?: boolean;
  };
  /**
   * Experience section ordering
   */
  experienceOrder?: string[];
  /**
   * Default color scheme
   */
  defaultColors?: {
    primary: string;
    secondary: string;
    accent?: string;
    text: string;
    background: string;
  };
  /**
   * Default font settings
   */
  defaultFonts?: {
    heading: string;
    body: string;
    mono?: string;
  };
  /**
   * Layout configuration options
   */
  layout?: LayoutOptions;
  /**
   * Feature flags for template capabilities
   */
  features?: {
    supportsCustomColors: boolean;
    supportsCustomFonts: boolean;
    supportsCustomLayout: boolean;
    supportsSectionReordering: boolean;
    supportsProfilePhoto: boolean;
  };
  /**
   * Default paper size for this template
   */
  defaultPaperSize?: PaperSize;
}

/**
 * CV template definition for generating resumes and CVs
 */
export interface CVTemplate {
  /**
   * Unique template identifier
   */
  id: string;
  /**
   * Display name for the template
   */
  name: string;
  /**
   * Template description
   */
  description: string;
  /**
   * Path to the template file
   */
  templatePath: string;
  /**
   * Template author information
   */
  author?: {
    name: string;
    email?: string;
    website?: string;
  };
  /**
   * Template version
   */
  version: string;
  /**
   * Target audience or use case
   */
  targetAudience?: string[];
  /**
   * Industry focus if applicable
   */
  industry?: string[];
  /**
   * Career level suitability
   */
  careerLevel?: ('entry' | 'mid' | 'senior' | 'executive' | 'academic')[];
  /**
   * Template customization options
   */
  options: TemplateOptions;
  /**
   * Sections supported by this template
   */
  supportedSections: string[];
  /**
   * Required sections that must be included
   */
  requiredSections: string[];
  /**
   * Template preview information
   */
  preview?: {
    thumbnail: string;
    fullPreview?: string;
  };
  /**
   * ATS compatibility rating (1-5)
   */
  atsCompatibility?: number;
}

