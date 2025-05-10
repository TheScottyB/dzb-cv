import type { CVData } from './base.js';

/**
 * Represents an academic publication entry
 * @interface Publication
 */
export interface Publication {
  /** The title of the publication */
  title: string;
  /** List of authors (formatted string) */
  authors: string;
  /** Name of the journal or publication venue */
  journal: string;
  /** Publication year */
  year: string;
  /** Journal volume */
  volume: string;
  /** Journal issue (optional) */
  issue?: string;
  /** Page range */
  pages: string;
  /** Digital Object Identifier */
  doi?: string;
  /** Publication status */
  status?: 'published' | 'in-press' | 'submitted' | 'in-preparation';
}

/**
 * Represents a conference presentation or attendance
 * @interface Conference
 */
export interface Conference {
  /** Presentation title */
  title: string;
  /** List of presenters (formatted string) */
  authors: string;
  /** Name of the conference */
  conferenceName: string;
  /** Conference location */
  location: string;
  /** Conference year */
  year: string;
  /** Additional details about the presentation */
  description?: string;
  /** Type of presentation */
  type?: 'oral' | 'poster' | 'workshop' | 'keynote';
}

/**
 * Represents a research grant or funding
 * @interface Grant
 */
export interface Grant {
  /** Grant title or project name */
  title: string;
  /** Funding agency */
  agency: string;
  /** Grant amount (formatted string) */
  amount: string;
  /** Year awarded */
  year: string;
  /** Project description */
  description?: string;
  /** Current status of the grant */
  status?: 'active' | 'completed' | 'pending';
  /** Role in the grant (e.g., PI, Co-PI) */
  role?: string;
  /** Grant duration */
  duration?: string;
}

/**
 * Represents a course taught
 * @interface Course
 */
export interface Course {
  /** Course title */
  title: string;
  /** Course code/number */
  code: string;
  /** Academic level */
  level: 'undergraduate' | 'graduate';
  /** Semester/term */
  semester: string;
  /** Academic year */
  year: string;
  /** Course description */
  description?: string;
}

/**
 * Represents student/postdoc supervision
 * @interface Supervision
 */
export interface Supervision {
  /** Type of supervision */
  type: 'phd' | 'masters' | 'undergraduate' | 'postdoc';
  /** Student/supervisee name */
  name: string;
  /** Project/thesis title */
  title: string;
  /** Supervision status */
  status: 'current' | 'completed';
  /** Year of completion (if applicable) */
  year?: string;
}

/**
 * Represents academic service or committee work
 * @interface AcademicService
 */
export interface AcademicService {
  /** Service role */
  role: string;
  /** Organization or committee name */
  organization: string;
  /** Time period of service */
  period: string;
  /** Additional details */
  description?: string;
}

/**
 * Extended CV data structure for academic CVs
 * @interface AcademicCVData
 * @extends {CVData}
 */
export interface AcademicCVData extends CVData {
  /** List of publications */
  publications?: Publication[];
  /** Conference presentations */
  conferences?: Conference[];
  /** Research grants and funding */
  grants?: Grant[];
  /** Teaching experience */
  teachingExperience?: {
    /** Courses taught */
    courses: Course[];
    /** Student supervision */
    supervision: Supervision[];
  };
  /** Research interests/areas */
  researchInterests?: string[];
  /** Academic service and committee work */
  academicService?: AcademicService[];
}
