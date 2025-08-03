declare module '@dzb-cv/types' {
  // Re-export types from consolidated base package
  export * from '../packages/types/src/cv/base';
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
  generateMarkdown(data: CVData, options?: TemplateOptions): string;
}

interface TemplateOptions {
  style?: 'professional' | 'academic' | 'modern' | 'minimal';
  format?: 'markdown' | 'html' | 'latex';
  includePhoto?: boolean;
  sections?: string[];
  customFields?: Record<string, unknown>;
}

// Legacy global interfaces - use @dzb-cv/types instead
// These are kept for backward compatibility but will be deprecated

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
  examples?: string[];
  category?: string;
  message?: string;
  fix?: string;
  priority?: 'high' | 'medium' | 'low';
  type?: 'keyword' | 'format' | 'structure' | 'content';
}

// Fix for ATSImprovement
interface ATSImprovement {
  message: string;
  fix: string;
  priority: 'high' | 'medium' | 'low';
  type: 'keyword' | 'format' | 'structure' | 'content';
  score?: number;
  examples?: string[];
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

