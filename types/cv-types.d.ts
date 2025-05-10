declare module '@dzb-cv/types' {
  export interface Name {
    first: string;
    middle?: string;
    last: string;
    full: string;
  }

  export interface PersonalInfo {
    name: Name;
    contact: {
      email: string;
      phone: string;
      address?: string;
      linkedin?: string;
      github?: string;
      website?: string;
    };
    professionalTitle?: string;
    summary?: string;
  }

  export interface Experience {
    employer: string;
    position: string;
    startDate: string;
    endDate?: string;
    location?: string;
    responsibilities: string[];
    achievements?: string[];
    employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
  }

  export interface Education {
    institution: string;
    degree: string;
    field: string;
    graduationDate: string;
    gpa?: string;
    honors?: string[];
  }

  export interface Skill {
    name: string;
    level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    category?: string;
  }

  export interface Certification {
    name: string;
    issuer: string;
    date: string;
    expiryDate?: string;
  }

  export interface ValidationError {
    field: string;
    message: string;
    code: string;
  }

  export interface Award {
    name: string;
    issuer: string;
    date: string;
    description?: string;
  }

  export interface Publication {
    title: string;
    authors: string[];
    journal?: string;
    publisher: string;
    date: string;
    doi?: string;
    url?: string;
  }

  export interface CVData {
    personalInfo: PersonalInfo;
    experience: Experience[];
    education: Education[];
    skills: Skill[];
    certifications?: Certification[];
    publications?: Publication[];
    awards?: Award[];
    languages?: string[];
    interests?: string[];
    metadata?: Record<string, unknown>;
  }

  export interface Template {
    id: string;
    name: string;
    description: string;
    generateMarkdown(data: CVData, options?: any): string;
  }
  
  export interface PDFGenerationOptions {
    template?: 'default' | 'minimal' | 'federal' | 'academic';
    format?: 'A4' | 'Letter';
    includeHeaderFooter?: boolean;
    margin?: {
      top?: string | number;
      right?: string | number;
      bottom?: string | number;
      left?: string | number;
    };
  }
}

