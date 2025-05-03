/**
 * Core Curriculum Vitae (CV) data structures and interfaces
 * 
 * This module defines the fundamental types used throughout the CV generation system.
 * It serves as the central source of type definitions that all other modules import from.
 * 
 * All types follow a consistent naming convention:
 * - PascalCase for interface names
 * - camelCase for properties
 * - Consistent use of optional properties
 * - Uniform date formatting (ISO string format)
 */

/**
 * Name structure for consistent representation across the application
 */
export interface Name {
  first: string;
  middle?: string;
  last: string;
  prefix?: string;
  suffix?: string;
  /**
   * Full name can be provided directly or composed from parts
   */
  full?: string;
}

/**
 * Address information with consistent structure
 */
export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  /**
   * Full address as a single string for display purposes
   */
  formatted?: string;
}

/**
 * Social media or other web link with standardized structure
 */
export interface SocialLink {
  /**
   * Display name for the link (e.g., "LinkedIn", "GitHub")
   */
  label: string;
  /**
   * Full URL to the profile or page
   */
  url: string;
  /**
   * Optional icon identifier for UI rendering
   */
  icon?: string;
}

/**
 * Personal information section of a CV
 */
export interface PersonalInfo {
  /**
   * Structured name information
   */
  name: Name;
  /**
   * Contact information
   */
  email?: string;
  phone?: string;
  address?: Address;
  website?: string;
  /**
   * Social media profiles and other web links
   */
  profiles?: SocialLink[];
  /**
   * Professional title (e.g., "Software Engineer", "Professor of Economics")
   */
  title?: string;
  /**
   * Professional headline or summary statement
   */
  summary?: string;
  /**
   * URL or base64 encoded photo data
   */
  photo?: string;
  /**
   * Additional fields that may be required in specific contexts
   */
  nationality?: string;
  dateOfBirth?: string;
  visaStatus?: string;
}

/**
 * Work experience entry
 */
export interface Experience {
  /**
   * Unique identifier for the experience entry
   */
  id?: string;
  /**
   * Job title or position name
   */
  position: string;
  /**
   * Company or organization name
   */
  employer: string;
  /**
   * Physical location of the job
   */
  location?: string;
  /**
   * Department or division within the organization
   */
  department?: string;
  /**
   * Start date in ISO format (YYYY-MM-DD)
   */
  startDate: string;
  /**
   * End date in ISO format or "present" for current positions
   */
  endDate?: string;
  /**
   * Flag to indicate if this is the current position
   */
  current?: boolean;
  /**
   * General job description
   */
  description?: string;
  /**
   * Key job responsibilities as bullet points
   */
  responsibilities?: string[];
  /**
   * Notable achievements in this role
   */
  achievements?: string[];
  /**
   * Technologies or tools used in this role
   */
  technologies?: string[];
  /**
   * Type of employment arrangement
   */
  employmentType?: 'full-time' | 'part-time' | 'contract' | 'internship' | 'volunteer' | string;
  /**
   * Keywords for searchability and ATS optimization
   */
  keywords?: string[];
  /**
   * Highlights or key points to emphasize
   */
  highlights?: string[];
  /**
   * Company website or relevant URL
   */
  url?: string;
  /**
   * Option to hide dates on generated CV
   */
  hideDates?: boolean;
  /**
   * Federal template specific fields
   */
  gradeLevel?: string;
  salary?: string;
  supervisor?: string;
  mayContact?: boolean;
}

/**
 * Reference person for recommendations
 */
export interface Reference {
  /**
   * Name of the reference
   */
  name: string;
  /**
   * Reference's position or title
   */
  position?: string;
  /**
   * Company or organization
   */
  company?: string;
  /**
   * Relationship to the candidate
   */
  relationship?: string;
  /**
   * Contact email
   */
  email?: string;
  /**
   * Contact phone number
   */
  phone?: string;
  /**
   * Reference letter or description
   */
  reference?: string;
  /**
   * Whether the reference should be contacted before sharing their information
   */
  contactBefore?: boolean;
}

/**
 * Language proficiency entry
 */
export interface Language {
  /**
   * Name of the language
   */
  name: string;
  /**
   * Proficiency level descriptor
   */
  fluency: 'native' | 'fluent' | 'proficient' | 'intermediate' | 'basic' | string;
  /**
   * Language certification (e.g., TOEFL, IELTS)
   */
  certification?: string;
  /**
   * Certification score if applicable
   */
  score?: string;
}

/**
 * Project entry for portfolio
 */
export interface Project {
  /**
   * Unique identifier
   */
  id?: string;
  /**
   * Project name
   */
  name: string;
  /**
   * Project description
   */
  description?: string;
  /**
   * Role in the project
   */
  role?: string;
  /**
   * Project URL
   */
  url?: string;
  /**
   * Repository URL
   */
  repo?: string;
  /**
   * Start date in ISO format
   */
  startDate?: string;
  /**
   * End date in ISO format
   */
  endDate?: string;
  /**
   * Flag to indicate if project is ongoing
   */
  current?: boolean;
  /**
   * Technologies used in the project
   */
  technologies?: string[];
  /**
   * Key highlights of the project
   */
  highlights?: string[];
  /**
   * Project team members
   */
  team?: string[];
  /**
   * Type of project (e.g., "Personal", "Academic", "Professional")
   */
  type?: string;
  /**
   * Media associated with the project
   */
  media?: {
    type: 'image' | 'video' | 'document';
    url: string;
    caption?: string;
  }[];
  /**
   * Option to hide dates on generated CV
   */
  hideDates?: boolean;
}

/**
 * Publication entry
 */
export interface Publication {
  /**
   * Unique identifier
   */
  id?: string;
  /**
   * Publication title
   */
  title: string;
  /**
   * List of authors
   */
  authors: string[];
  /**
   * Publisher name
   */
  publisher?: string;
  /**
   * Journal name if applicable
   */
  journal?: string;
  /**
   * Publication date
   */
  date?: string;
  /**
   * Digital Object Identifier
   */
  doi?: string;
  /**
   * URL to the publication
   */
  url?: string;
  /**
   * Publication abstract
   */
  abstract?: string;
  /**
   * Formatted citation
   */
  citation?: string;
  /**
   * Type of publication
   */
  type?: 'article' | 'conference' | 'book' | 'chapter' | 'thesis' | 'other';
  /**
   * Keywords for the publication
   */
  keywords?: string[];
  /**
   * Impact factor or similar metric
   */
  impact?: string;
}

/**
 * Award or honor entry
 */
export interface Award {
  /**
   * Award title or name
   */
  title: string;
  /**
   * Organization that issued the award
   */
  issuer?: string;
  /**
   * Alternative field name for issuer
   */
  awarder?: string;
  /**
   * Date received
   */
  date?: string;
  /**
   * Description of the award
   */
  description?: string;
  /**
   * Summary of the award significance
   */
  summary?: string;
}

/**
 * Volunteer experience entry
 */
export interface Volunteer {
  /**
   * Organization name
   */
  organization: string;
  /**
   * Role or position title
   */
  position: string;
  /**
   * Organization website
   */
  website?: string;
  /**
   * Start date in ISO format
   */
  startDate?: string;
  /**
   * End date in ISO format
   */
  endDate?: string;
  /**
   * Description of volunteer work
   */
  summary?: string;
  /**
   * Key highlights or contributions
   */
  highlights?: string[];
  /**
   * Location of volunteer work
   */
  location?: string;
}

/**
 * Educational background entry
 */
export interface Education {
  /**
   * Unique identifier for the education entry
   */
  id?: string;
  /**
   * Degree name (e.g., "Bachelor of Science", "Master of Arts")
   */
  degree: string;
  /**
   * Field of study or major (e.g., "Computer Science", "Economics")
   */
  field?: string;
  /**
   * School or university name
   */
  institution: string;
  /**
   * Location of the institution
   */
  location?: string;
  /**
   * Start date in ISO format
   */
  startDate?: string;
  /**
   * End date in ISO format
   */
  endDate?: string;
  /**
   * Alternative to using endDate for completed education
   */
  completionDate?: string; 
  /**
   * Simplified year representation (e.g., "2020")
   */
  year?: string;
  /**
   * Flag to indicate if education is in progress
   */
  current?: boolean;
  /**
   * GPA or other grade representation
   */
  gpa?: string;
  /**
   * Overall description of the educational experience
   */
  description?: string;
  /**
   * Honors received during education
   */
  honors?: string[];
  /**
   * Activities participated in during education
   */
  activities?: string[];
  /**
   * Relevant coursework
   */
  courses?: string[];
  /**
   * Additional notes about the education
   */
  notes?: string[];
  /**
   * Status of education (e.g., "Completed", "In Progress")
   */
  status?: string;
  /**
   * Thesis or dissertation information
   */
  thesis?: {
    title: string;
    advisor?: string;
    description?: string;
  };
  /**
   * Institution website
   */
  url?: string;
  /**
   * Option to hide dates on generated CV
   */
  hideDates?: boolean;
}

/**
 * Skill entry for a CV
 */
export interface Skill {
  /**
   * Name of the skill
   */
  name: string;
  /**
   * Proficiency level
   */
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | string;
  /**
   * Category to group skills (e.g., "Programming Languages", "Tools")
   */
  category?: string;
  /**
   * Related keywords for searchability
   */
  keywords?: string[];
  /**
   * Years of experience with the skill
   */
  yearsOfExperience?: number;
  /**
   * Additional description of skill proficiency
   */
  description?: string;
  /**
   * Whether this skill has been verified
   */
  verified?: boolean;
  /**
   * When the skill was last used
   */
  lastUsed?: string;
}

/**
 * Certification or credential entry
 */
export interface Certification {
  /**
   * Unique identifier
   */
  id?: string;
  /**
   * Name of the certification
   */
  name: string;
  /**
   * Organization that issued the certification
   */
  issuer: string;
  /**
   * Date the certification was earned
   */
  date: string;
  /**
   * Expiration date if applicable
   */
  expiry?: string;
  /**
   * Verification URL or credential ID
   */
  url?: string;
  /**
   * Credential identifier
   */
  credential?: string;
  /**
   * Description of the certification
   */
  description?: string;
  /**
   * Score or grade achieved if applicable
   */
  score?: string;
  /**
   * URL to certification logo
   */
  logo?: string;
}

/**
 * PDF generation specific options
 */
export interface PDFGenerationOptions {
  /**
   * Template to use for PDF generation
   */
  template?: string;
  /**
   * Paper size
   */
  paperSize?: 'a4' | 'letter' | 'legal';
  /**
   * Page orientation
   */
  orientation?: 'portrait' | 'landscape';
  /**
   * Font settings
   */
  fonts?: {
    primary?: string;
    secondary?: string;
    size?: number;
  };
  /**
   * Page margins in points or millimeters
   */
  margins?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  /**
   * Color scheme
   */
  colors?: {
    primary?: string;
    secondary?: string;
    text?: string;
    background?: string;
  };
  /**
   * Additional PDF metadata
   */
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string[];
  };
}

export interface CVGenerationOptions {
  format: 'pdf' | 'docx';
  pdfOptions?: PDFGenerationOptions;
}

/**
 * Academic teaching experience for academic CVs
 */
export interface TeachingExperience {
  /**
   * Course name or code
   */
  course: string;
  /**
   * Institution where teaching was performed
   */
  institution: string;
  /**
   * Position (e.g., "Instructor", "Teaching Assistant")
   */
  position: string;
  /**
   * When the teaching role began
   */
  startDate: string;
  /**
   * When the teaching role ended
   */
  endDate?: string;
  /**
   * Flag for ongoing teaching roles
   */
  current?: boolean;
  /**
   * Description of teaching responsibilities
   */
  description?: string;
  /**
   * Student evaluations with scores and comments
   */
  evaluations?: {
    score: number;
    scale: string;
    comments?: string;
  }[];
  /**
   * Primary teaching responsibilities
   */
  responsibilities?: string[];
  /**
   * Number of students taught
   */
  students?: number;
  /**
   * Link to course information or evaluations
   */
  url?: string;
}

/**
 * Research experience for academic CVs
 */
export interface ResearchExperience {
  /**
   * Research project title
   */
  title: string;
  /**
   * Research institution
   */
  institution: string;
  /**
   * Position or role in the research
   */
  position: string;
  /**
   * When the research began
   */
  startDate: string;
  /**
   * When the research ended
   */
  endDate?: string;
  /**
   * Flag for ongoing research
   */
  current?: boolean;
  /**
   * Description of the research
   */
  description?: string;
  /**
   * Key findings or contributions
   */
  highlights?: string[];
  /**
   * Related publications
   */
  publications?: string[];
  /**
   * Funding source information
   */
  funding?: string;
  /**
   * Link to research project information
   */
  url?: string;
}

/**
 * Grant information for academic CVs
 */
export interface Grant {
  /**
   * Grant title
   */
  title: string;
  /**
   * Funding agency
   */
  agency: string;
  /**
   * Amount of funding
   */
  amount: string;
  /**
   * Award date
   */
  date: string;
  /**
   * End date of grant period
   */
  endDate?: string;
  /**
   * Role on the grant (e.g., "Principal Investigator")
   */
  role: string;
  /**
   * Current status of the grant
   */
  status: 'awarded' | 'submitted' | 'rejected' | 'in progress';
  /**
   * Description of the grant project
   */
  description?: string;
  /**
   * Other investigators on the grant
   */
  collaborators?: string[];
  /**
   * Link to grant information
   */
  url?: string;
}

/**
 * Committee service for academic CVs
 */
export interface Committee {
  /**
   * Committee name
   */
  name: string;
  /**
   * Institution or organization
   */
  institution: string;
  /**
   * Role on the committee
   */
  position: string;
  /**
   * When committee service began
   */
  startDate: string;
  /**
   * When committee service ended
   */
  endDate?: string;
  /**
   * Flag for ongoing committee service
   */
  current?: boolean;
  /**
   * Description of responsibilities
   */
  description?: string;
  /**
   * Link to committee information
   */
  url?: string;
}

/**
 * Academic service activities for academic CVs
 */
export interface AcademicService {
  /**
   * Type of service
   */
  type: 'reviewer' | 'editor' | 'chair' | 'organizer' | 'other';
  /**
   * Publication or venue name
   */
  publication: string;
  /**
   * Specific role
   */
  role: string;
  /**
   * When service began
   */
  startDate?: string;
  /**
   * When service ended
   */
  endDate?: string;
  /**
   * Flag for ongoing service
   */
  current?: boolean;
  /**
   * Description of service activities
   */
  description?: string;
  /**
   * Link to related information
   */
  url?: string;
}

/**
 * Complete CV data structure that combines all core CV sections
 */
export interface CVData {
  /**
   * Personal and contact information
   */
  personalInfo: PersonalInfo;
  /**
   * Work experience entries
   */
  experience: Experience[];
  /**
   * Education history
   */
  education: Education[];
  /**
   * Skills and competencies
   */
  skills: Skill[];
  /**
   * Projects (personal, professional, academic)
   */
  projects?: Project[];
  /**
   * Published works
   */
  publications?: Publication[];
  /**
   * Certifications and credentials
   */
  certifications?: Certification[];
  /**
   * Languages spoken or written
   */
  languages?: Language[];
  /**
   * Volunteer experience
   */
  volunteer?: Volunteer[];
  /**
   * Awards and honors
   */
  awards?: Award[];
  /**
   * Professional references
   */
  references?: Reference[];
}

/**
 * Academic CV data structure that extends the base CV with academic-specific sections
 */
export interface AcademicCVData extends CVData {
  /**
   * Teaching experience entries
   */
  teaching: TeachingExperience[];
  /**
   * Research experience entries
   */
  research: ResearchExperience[];
  /**
   * Grant and funding information
   */
  grants: Grant[];
  /**
   * Committee service
   */
  committees: Committee[];
  /**
   * Academic service activities
   */
  academicService: AcademicService[];
}

/**
 * Template options for customizing CV generation
 */
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
  layout?: {
    sectionOrder?: string[];
    columns?: 1 | 2;
    header?: 'minimal' | 'standard' | 'prominent';
    spacing?: 'compact' | 'standard' | 'comfortable';
  };
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
   * Generation-specific options
   */
  generationOptions?: PDFGenerationOptions;
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

/**
 * ATS (Applicant Tracking System) improvement suggestion
 */
export interface ATSImprovement {
  /**
   * Type of improvement
   */
  type: 'keyword' | 'structure' | 'formatting' | 'content' | 'compatibility';
  /**
   * Target section in the CV
   */
  section?: string;
  /**
   * Severity level
   */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /**
   * Description of the issue
   */
  issue: string;
  /**
   * Suggested improvement
   */
  suggestion: string;
  /**
   * Expected impact of implementing the suggestion
   */
  impact?: string;
  /**
   * Reason behind the suggestion
   */
  rationale?: string;
  /**
   * Example of implementation
   */
  example?: string;
  /**
   * Keywords that would be enhanced by this improvement
   */
  enhancedKeywords?: string[];
}
