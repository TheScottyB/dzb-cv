declare module '@dzb-cv/types' {
  export interface PersonalInfo {
    name: {
      first: string;
      middle?: string;
      last: string;
      full: string;
    };
    contact: {
      email: string;
      phone: string;
      address?: string;
      linkedin?: string;
      github?: string;
      website?: string;
    };
    professionalTitle?: string;
    summary?: string;
  }

  export interface Experience {
    employer: string;
    position: string;
    startDate: string;
    endDate?: string;
    location?: string;
    responsibilities: string[];
    achievements?: string[];
    employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
  }

  export interface Education {
    institution: string;
    degree: string;
    field: string;
    graduationDate: string;
    gpa?: string;
    honors?: string[];
  }

  export interface Skill {
    name: string;
    level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    category?: string;
  }

  export interface Certification {
    name: string;
    issuer: string;
    date: string;
    expiryDate?: string;
  }

  export interface CVData {
    personalInfo: PersonalInfo;
    experience: Experience[];
    education: Education[];
    skills: Skill[];
    certifications?: Certification[];
    languages?: string[];
    interests?: string[];
    metadata?: Record<string, unknown>;
  }

  export interface Template {
    id: string;
    name: string;
    description: string;
    generateMarkdown(data: CVData, options?: any): string;
  }
}

// types/global.d.ts

// Extend Vitest Expect interface
interface CustomMatchers<R = unknown> {
  toHaveLength: (length: number) => R;
  toBeInstanceOf: (constructor: Function) => R;
  toBeGreaterThan: (number: number) => R;
  toContainEqual: (item: unknown) => R;
  toBeNull: () => R;
  toHaveBeenCalled: () => R;
  toHaveBeenCalledTimes: (times: number) => R;
  toMatch: (pattern: RegExp | string) => R;
  not: CustomMatchers<R>;
}

declare module 'vitest' {
  interface Assertion extends CustomMatchers {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}

  interface Vi {
    clearAllMocks: () => void;
    fn: () => any;
    spyOn: (obj: any, method: string) => any;
    mock: (moduleName: string) => any;
  }
}

// Puppeteer types
declare module 'puppeteer' {
  export interface LaunchOptions {
    headless?: boolean | "new" | "shell";
    args?: string[];
    executablePath?: string;
    defaultViewport?: { width: number; height: number };
    timeout?: number;
    slowMo?: number;
    devtools?: boolean;
  }

  export interface Browser {
    newPage(): Promise<Page>;
    close(): Promise<void>;
  }

  export interface Page {
    setContent(html: string, options?: { waitUntil?: string | string[] }): Promise<void>;
    pdf(options?: PDFOptions): Promise<Buffer>;
    close(): Promise<void>;
    evaluate<T>(fn: () => T): Promise<T>;
    content(): Promise<string>;
    url(): string;
    setViewport(options: { width: number; height: number }): Promise<void>;
    setUserAgent(userAgent: string): Promise<void>;
    goto(url: string, options?: { waitUntil?: string | string[] }): Promise<void>;
    title(): Promise<string>;
    screenshot(options?: { path?: string; fullPage?: boolean }): Promise<void>;
    setCookie(...cookies: any[]): Promise<void>;
    $eval<T>(selector: string, fn: (element: Element) => T): Promise<T>;
    $(selector: string): Promise<any>;
  }

  export interface PDFOptions {
    path?: string;
    scale?: number;
    displayHeaderFooter?: boolean;
    headerTemplate?: string;
    footerTemplate?: string;
    printBackground?: boolean;
    landscape?: boolean;
    pageRanges?: string;
    format?: string;
    width?: string | number;
    height?: string | number;
    margin?: {
      top?: string | number;
      right?: string | number;
      bottom?: string | number;
      left?: string | number;
    };
  }

  export type PaperFormat = string;
  export type PDFMargin = {
    top?: string | number;
    right?: string | number;
    bottom?: string | number;
    left?: string | number;
  };

  const puppeteer: {
    launch: (options?: LaunchOptions) => Promise<Browser>;
    connect: (options: { browserURL: string }) => Promise<Browser>;
  };
  export default puppeteer;
}

// CheerioAPI types
declare module 'cheerio' {
  export interface CheerioAPI {
    (selector: string): Cheerio;
    load: (content: string) => CheerioAPI;
    version: string;
  }

  export interface Cheerio {
    text(): string;
    find(selector: string): Cheerio;
    map<T>(callback: (index: number, element: any) => T): T[];
  }
}

// CVTemplate interface
interface CVTemplate {
  id: string;
  name: string;
  getStyles(): string;
  generateMarkdown(data: CVData, options?: any): string;
}

// Basic types for CV data
interface CVData {
  personalInfo: {
    name: {
      full: string;
      first?: string;
      last?: string;
    };
    contact: {
      email: string;
      phone: string;
      address?: string;
      linkedin?: string;
      website?: string;
    };
    title?: string;
    citizenship?: string;
    summary?: string;
  };
  experience: ExperienceEntry[];
  education: EducationEntry[];
  publications?: any[];
  // Add other necessary fields
}

interface ExperienceEntry {
  title: string;
  company: string;
  position?: string;
  employer?: string;
  employmentType?: string;
  employment_type?: string;
  startDate: string;
  endDate?: string;
  responsibilities: string[];
  achievements?: string[];
  location?: string;
  grade_level?: string;
  gradeLevel?: string;
  salary?: string;
  supervisor?: string;
  mayContact?: boolean;
  careerProgression?: string[];
  period?: string;
}

interface EducationEntry {
  degree: string;
  institution: string;
  year: string;
  location?: string;
  field?: string;
  status?: string;
  notes?: string;
  completionDate?: string;
  gpa?: string;
  honors?: string[];
  courses?: string[];
}

// Fix for ProfileChange
interface ProfileChange {
  type: string;
  resolutionNote?: string;
  // Add other required properties
}

// Fix for HandlebarsTemplateDelegate
declare module 'handlebars' {
  export type RuntimeOptions = any;
  export type HandlebarsTemplateDelegate<T = any> = (context: T, options?: RuntimeOptions) => string;
}

// Fix for JobInfo
interface JobInfo {
  _decompressionMethod?: string;
  _extractionFailed?: boolean;
  error?: string;
}

// Fix for ATSIssue
interface ATSIssue {
  score?: number;
  examples?: any;
  category?: string;
  message?: string;
  fix?: string;
  priority?: string;
  type?: any;
}

// Fix for ATSImprovement
interface ATSImprovement {
  message: string;
  fix: string;
  priority: string;
  type: any;
  score?: number;
  examples?: any;
}

// Fix for publication
interface Publication {
  title: string;
  publisher?: string;
  date?: string;
  year?: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  authors?: string;
}

