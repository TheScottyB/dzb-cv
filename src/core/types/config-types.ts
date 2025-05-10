/**
 * Configuration type definitions
 */

export interface AppConfig {
  /**
   * Base path for templates
   */
  templatesPath: string;

  /**
   * Output directory for generated files
   */
  outputPath: string;

  /**
   * Default file format for output
   */
  defaultFormat: 'pdf' | 'markdown';
}

export interface PDFConfig {
  /**
   * Default styling for PDF
   */
  defaultStyles?: string;

  /**
   * Page size and margins
   */
  pageConfig: {
    size: string;
    margin: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  };
}
