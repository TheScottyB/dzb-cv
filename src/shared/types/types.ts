export interface ConfigOptions {
  url: string;
  headless?: boolean;
  waitTime?: number;
  outputDir?: string;
  saveHtml?: boolean;
  saveScreenshot?: boolean;
  savePdf?: boolean;
}

export interface ScraperResult {
  success: boolean;
  data?: {
    title: string;
    company: string;
    location: string;
    description: string;
    responsibilities?: string[];
    qualifications?: string[];
    skills?: string[];
    education?: string[];
    experience?: string[];
    metadata?: {
      postedDate?: string;
      closingDate?: string;
      salary?: string;
      employmentType?: string;
    };
  };
  error?: string;
  metadata: {
    duration: number;
    timestamp: string;
  };
} 