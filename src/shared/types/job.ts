export interface JobPosting {
  url: string;
  title: string;
  company: string;
  location: string;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  htmlPath: string;
  screenshotPath: string;
  metadata?: {
    url: string;
    source: string;
    id: string;
    postedDate: string;
    expiryDate: string | null;
  };
}

export interface JobInfo extends JobPosting {
  error?: string;
  _parseError?: string;
  _decompressionMethod?: string;
  _extractionFailed?: boolean;
}

export interface JobScraperOptions {
  outputDir?: string;
  headless?: boolean;
  timeout?: number;
  retries?: number;
  delay?: number;
}
