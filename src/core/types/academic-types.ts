import type { CVData } from './cv-base.js';

export interface Publication {
  authors: string;
  year: string;
  title: string;
  journal: string;
  volume: string;
  issue?: string;
  pages: string;
}

export interface Conference {
  title: string;
  authors: string;
  year: string;
  conferenceName: string;
  location: string;
  description?: string;
}

export interface Grant {
  title: string;
  year: string;
  amount: string;
  agency: string;
  description?: string;
}

export interface Award {
  title: string;
  year: string;
  organization?: string;
  description?: string;
}

export interface AcademicCVData extends CVData {
  publications?: Publication[];
  conferences?: Conference[];
  grants?: Grant[];
  awards?: Award[];
}

