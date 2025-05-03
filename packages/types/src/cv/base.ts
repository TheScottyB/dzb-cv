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
  position: string;
  employer: string;  // Add this field
  startDate: string;
  endDate?: string;
  location?: string;
  responsibilities: string[];  // Add this field
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

export interface CVData {
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects?: { 
    name: string;
    description: string;
    technologies?: string[];
    url?: string;
  }[];
  languages?: {
    language: string;
    proficiency: string;
  }[];
  certifications?: {
    name: string;
    issuer: string;
    date: string;
    url?: string;
    expirationDate?: string;
  }[];
}
