import type { CVData, Publication, Award, Experience } from './cv-base.js';

/**
 * Academic-specific sections for CVs
 */

/**
 * Publication data for academic CVs
 */
export interface AcademicPublication {
  /**
   * Publication title
   */
  title: string;
  
  /**
   * Authors of the publication (comma-separated string or formatted citation)
   */
  authors: string;
  
  /**
   * Journal name where published
   */
  journal?: string;
  
  /**
   * Volume number
   */
  volume?: string;
  
  /**
   * Issue number
   */
  issue?: string;
  
  /**
   * Page range
   */
  pages?: string;
  
  /**
   * Publication year
   */
  year: string;
  
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
   * Type of publication
   */
  type?: 'journal' | 'conference' | 'book' | 'chapter' | 'thesis' | 'other';
  
  /**
   * Publication status
   */
  status?: 'published' | 'in press' | 'under review' | 'in preparation';
}

/**
 * Conference presentation data for academic CVs
 */
export interface Conference {
  /**
   * Presentation title
   */
  title: string;
  
  /**
   * Authors or presenters
   */
  authors: string;
  
  /**
   * Name of the conference
   */
  conferenceName: string;
  
  /**
   * Location where the conference was held
   */
  location: string;
  
  /**
   * Year of the conference
   */
  year: string;
  
  /**
   * Type of presentation
   */
  type?: 'poster' | 'oral' | 'panel' | 'workshop';
  
  /**
   * Presentation abstract
   */
  abstract?: string;
  
  /**
   * URL to conference or presentation materials
   */
  url?: string;
}

/**
 * Academic teaching experience for academic CVs
 * Consolidated from both Teaching and TeachingExperience interfaces
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
  position?: string;
  
  /**
   * Role in the course (alternative to position)
   */
  role?: string;
  
  /**
   * Academic level of the course
   */
  level?: string;
  
  /**
   * When the teaching role began
   */
  startDate?: string;
  
  /**
   * When the teaching role ended
   */
  endDate?: string;
  
  /**
   * Time period in a simplified format (e.g., "Fall 2023")
   */
  period?: string;
  
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
    /**
     * Overall teaching score or rating
     */
    score?: string | number;
    
    /**
     * Rating scale information (e.g., "1-5", "1-10")
     */
    scale?: string;
    
    /**
     * Number of students who provided evaluations
     */
    respondents?: number;
    
    /**
     * Total number of students in the class
     */
    totalStudents?: number;
    
    /**
     * Detailed ratings for specific categories
     */
    categories?: Array<{
      name: string;
      score: string | number;
      comments?: string[];
    }>;
    
    /**
     * Student comments or feedback
     */
    comments?: string[];
    
    /**
     * Year or term when evaluations were collected
     */
    period?: string;
    
    /**
     * URL to full evaluation results if available
     */
    url?: string;
  };
}

/**
 * Grant or research funding for academic CVs
 */
export interface Grant {
  /**
   * Title of the grant or project
   */
  title: string;
  
  /**
   * Monetary amount of the grant
   */
  amount: string | number;
  
  /**
   * Currency of the grant amount
   */
  currency?: string;
  
  /**
   * Agency or organization providing the funding
   */
  fundingBody: string;
  
  /**
   * Start date of the grant period
   */
  startDate?: string;
  
  /**
   * End date of the grant period
   */
  endDate?: string;
  
  /**
   * Status of the grant
   */
  status?: 'awarded' | 'completed' | 'pending' | 'rejected' | string;
  
  /**
   * Role in the grant (PI, Co-PI, etc.)
   */
  role?: string;
  
  /**
   * Description of the grant project
   */
  description?: string;
  
  /**
   * Co-investigators or team members
   */
  collaborators?: string[];
  
  /**
   * Outcomes or deliverables of the project
   */
  projectOutcomes?: string[];
  
  /**
   * Grant reference or identification number
   */
  referenceNumber?: string;
  
  /**
   * Simplified period representation (e.g., "2022-2024")
   */
  period?: string;
  
  /**
   * URL to grant details or project website
   */
  url?: string;
}

/**
 * Academic service such as committee work, peer review, editorial roles
 */
export interface AcademicService {
  /**
   * Role or position in the service activity
   */
  role: string;
  
  /**
   * Organization or entity where service was performed
   */
  organization: string;
  
  /**
   * Start date of the service
   */
  startDate?: string;
  
  /**
   * End date of the service
   */
  endDate?: string;
  
  /**
   * Simplified period representation (e.g., "2020-Present")
   */
  period?: string;
  
  /**
   * Description of service activities
   */
  description?: string;
  
  /**
   * Type of academic service
   */
  type?: 'committee' | 'review' | 'editorial' | 'mentoring' | 'outreach' | 'administration' | string;
  
  /**
   * Level or scope of the service
   */
  level?: 'department' | 'faculty' | 'institution' | 'national' | 'international' | string;
  
  /**
   * URL to relevant service information
   */
  url?: string;
  
  /**
   * Impact or significance of the service
   */
  impact?: string;
  
  /**
   * Recognition received for this service
   */
  recognition?: string;
}

/**
 * Academic thesis or dissertation supervised
 */
export interface Thesis {
  /**
   * Type of thesis (PhD, Master's, etc.)
   */
  type: string;
  
  /**
   * Title of the thesis
   */
  title: string;
  
  /**
   * Student name
   */
  student: string;
  
  /**
   * Supervisor name (usually the CV owner)
   */
  supervisor: string;
  
  /**
   * Year of completion
   */
  year: string;
  
  /**
   * Institution where the thesis was completed
   */
  institution?: string;
  
  /**
   * Current status if not completed
   */
  status?: 'completed' | 'in progress' | string;
  
  /**
   * Brief description or abstract
   */
  description?: string;
  
  /**
   * URL to the thesis if publicly available
   */
  url?: string;
}

/**
 * Academic-specific CV data structure extending base CVData
 */
export interface AcademicCVData extends CVData {
  /**
   * Academic publications in journals, conferences, etc.
   */
  academicPublications?: AcademicPublication[];
  
  /**
   * Conference presentations
   */
  conferences?: Conference[];
  
  /**
   * Teaching experience
   */
  teachingExperience?: TeachingExperience[];
  
  /**
   * Grants and research funding
   */
  grants?: Grant[];
  
  /**
   * Academic service activities
   */
  academicService?: AcademicService[];
  
  /**
   * Research interests or focus areas
   */
  researchInterests?: string[];
  
  /**
   * Supervised theses and dissertations
   */
  theses?: Thesis[];
  
  /**
   * Courses developed or significantly modified
   */
  coursesDeveloped?: Array<{
    title: string;
    code?: string;
    institution?: string;
    year?: string;
    description?: string;
    level?: 'undergraduate' | 'graduate' | 'professional' | string;
  }>;
  
  /**
   * Professional memberships in academic organizations
   */
  professionalMemberships?: Array<{
    organization: string;
    role?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  
  /**
   * Academic honors and distinctions beyond awards
   */
  academicHonors?: Array<{
    title: string;
    issuer?: string;
    date?: string;
    description?: string;
  }>;
  
  /**
   * Research metrics and impact indicators
   */
  researchMetrics?: {
    hIndex?: number;
    citations?: number;
    source?: string;
    url?: string;
    lastUpdated?: string;
  };
  
  /**
   * Field work or research expeditions
   */
  fieldwork?: Array<{
    title: string;
    location: string;
    period?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    outcomes?: string[];
  }>;
}
