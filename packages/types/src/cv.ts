export interface Skill {
  name: string;
  level?: string;
}

export interface PersonalInfo {
  name: {
    first: string;
    last: string;
    full: string;
  };
  contact: {
    email: string;
    phone?: string;
    address?: string;
  };
}

export interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description?: string;
  employer: string;
  responsibilities?: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field?: string;
  startDate: string;
  endDate?: string;
  graduationDate?: string;
}

export interface CVData {
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
}

