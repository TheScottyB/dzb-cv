export interface Name {
  first: string;
  last: string;
  full: string;
}

export interface ContactInfo {
  email: string;
  phone?: string;
  address?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface PersonalInfo {
  name: Name;
  contact: ContactInfo;
  title?: string;
  summary?: string;
  profileImage?: string;
}

export interface Experience {
  position: string;
  employer: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  responsibilities?: string[];
  achievements?: string[];
  skills?: string[];
}

export interface Education {
  degree: string;
  institution: string;
  field?: string;
  location?: string;
  year: string;
  gpa?: string;
  honors?: string[];
  activities?: string[];
}

export interface Skill {
  name: string;
  level?: string;
  category?: string;
}

export interface Certification {
  name: string;
  issuer?: string;
  date?: string;
  expiration?: string;
  identifier?: string;
}

export interface CVData {
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  certifications?: Certification[];
  languages?: { language: string; proficiency: string }[];
  references?: { name: string; position: string; company: string; contact: string }[];
}
