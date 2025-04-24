export interface JobPosting {
  url: string;
  title?: string;
  company?: string;
  location?: string;
  description?: string;
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
  htmlPath?: string;
  screenshotPath?: string;
  pdfPath?: string;
}

export interface ScraperOptions {
  headless?: boolean;
  waitTime?: number;
  outputDir?: string;
  saveHtml?: boolean;
  saveScreenshot?: boolean;
  savePdf?: boolean;
  customUserAgent?: string;
}

export interface ScraperResult {
  success: boolean;
  data?: JobPosting;
  error?: string;
  metadata: {
    timestamp: string;
    duration: number;
    url: string;
  };
} 