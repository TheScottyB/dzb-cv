export interface JobData {
  source?: string;
  url?: string;
  urlInfo?: {
    baseUrl: string;
  };
  company: string;
  title: string;
  jobId?: string | number;
  location?: string;
  description?: string;
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
    period?: 'hourly' | 'monthly' | 'yearly';
  };
  employmentType?: 'full-time' | 'part-time' | 'contract' | 'temporary' | 'internship';
  postedDate?: string;
  closingDate?: string;
  department?: string;
  contactInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  metadata?: Record<string, unknown>;
}
