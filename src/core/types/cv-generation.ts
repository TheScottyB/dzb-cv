/**
 * CV Generation and PDF options
 */

import { Experience } from './cv-base.js';

export interface PDFOptions {
  includeHeaderFooter: boolean;
  headerText?: string;
  footerText?: string;
  paperSize?: 'Letter' | 'A4' | 'Legal';
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  pdfTitle?: string;
  pdfAuthor?: string;
  orientation?: 'portrait' | 'landscape';
  fontFamily?: string;
}

export interface TemplateOptions {
  includePersonalInfo?: boolean;
  includeProfessionalSummary?: boolean;
  includeEducation?: boolean;
  includeSkills?: boolean;
  includeExperience?: boolean;
  includeVolunteerWork?: boolean;
  includeAwards?: boolean;
  includeAffiliations?: boolean;
  customSections?: Array<{
    title: string;
    content: string;
  }>;
  experienceOrder?: string[];
  experienceFilter?: (exp: Experience) => boolean;
  customFooter?: string;
  customHeader?: string;
}

export interface CVGenerationOptions {
  format: 'markdown' | 'pdf';
  pdfOptions?: Partial<PDFOptions>;
  filename?: string;
}

