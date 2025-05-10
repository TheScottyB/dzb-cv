declare module 'puppeteer' {
  export interface Browser {
    newPage(): Promise<Page>;
    close(): Promise<void>;
    disconnect(): Promise<void>;
  }

  export interface Page {
    setContent(html: string): Promise<void>;
    pdf(options?: PDFOptions): Promise<Buffer>;
    close(): Promise<void>;
    evaluate<T>(fn: () => T | Promise<T>): Promise<T>;
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
    preferCSSPageSize?: boolean;
  }

  export interface LaunchOptions {
    headless?: boolean | 'new';
    defaultViewport?: {
      width: number;
      height: number;
    } | null;
    args?: string[];
  }

  export function launch(options?: LaunchOptions): Promise<Browser>;
  export function connect(options: { browserURL: string }): Promise<Browser>;
}

