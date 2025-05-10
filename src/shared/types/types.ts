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
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  qualifications: string[] | null;
  responsibilities: string[] | null;
  salary: string | null;
  employmentType: string | null;
  experienceLevel: string | null;
  education: string | null;
  skills: string[] | null;
  benefits: string[] | null;
  postedDate: string | null;
  closingDate: string | null;
  applicationUrl: string | null;
  sourceUrl: string;
  htmlPath: string | null;
  screenshotPath: string | null;
  metadata: Record<string, unknown>;
}
