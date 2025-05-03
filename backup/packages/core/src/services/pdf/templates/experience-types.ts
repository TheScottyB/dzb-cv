import { Experience } from '../../../types/cv-base.js';

export type LegacyExperience = Experience & {
  type: 'legacy';
  period: string;
  duties: string[];
  employmentType: string;
};

export type ModernExperience = Experience & {
  type: 'modern';
  position: string;
  employer: string;
  startDate: string;
  endDate?: string;
  responsibilities: string[];
};

export type ExperienceUnion = LegacyExperience | ModernExperience; 