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

  /**
   * AI/LLM configuration
   */
  ai?: AIConfig;
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

/**
 * AI/LLM Configuration
 */
export interface AIConfig {
  /**
   * OpenAI API configuration
   */
  openai: {
    /**
     * API Key for OpenAI (can be overridden by environment variable)
     */
    apiKey?: string;
    
    /**
     * Default model for content distillation
     */
    distillModel: string;
    
    /**
     * Default model for content optimization
     */
    optimizeModel: string;
    
    /**
     * Maximum retries for API calls
     */
    maxRetries: number;
    
    /**
     * Timeout for API calls in milliseconds
     */
    timeout: number;
  };
  
  /**
   * Default CV style for AI optimization
   */
  defaultStyle: 'professional' | 'academic' | 'technical' | 'executive';
  
  /**
   * Single-page layout constraints
   */
  singlePageConstraints: {
    maxLines: number;
    maxCharactersPerLine: number;
    pageFormat: 'A4' | 'Letter';
    margins: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  };
  
  /**
   * Enable/disable AI features
   */
  enabled: boolean;
  
  /**
   * Fallback behavior when AI is unavailable
   */
  fallbackMode: 'simulation' | 'error' | 'disable';
}

/**
 * Complete configuration interface
 */
export interface Config {
  app: AppConfig;
  pdf: PDFConfig;
  ai: AIConfig;
}
