import path from 'path';
import fs from 'fs/promises';
import { Config, AIConfig, AppConfig, PDFConfig } from '../../types/config-types';

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Config = {
  app: {
    templatesPath: 'src/shared/templates',
    outputPath: 'output',
    defaultFormat: 'pdf',
  },
  pdf: {
    pageConfig: {
      size: 'Letter',
      margin: {
        top: 1,
        right: 1,
        bottom: 1,
        left: 1,
      },
    },
  },
  ai: {
    openai: {
      distillModel: 'gpt-4o-mini',
      optimizeModel: 'gpt-4o-mini',
      maxRetries: 3,
      timeout: 30000,
    },
    defaultStyle: 'professional',
    singlePageConstraints: {
      maxLines: 45,
      maxCharactersPerLine: 80,
      pageFormat: 'Letter',
      margins: {
        top: 0.5,
        right: 0.5,
        bottom: 0.5,
        left: 0.5,
      },
    },
    enabled: true,
    fallbackMode: 'simulation',
  },
};

/**
 * Configuration service for managing application settings
 */
export class ConfigurationService {
  private config: Config;
  private configPath: string;

  constructor(configPath?: string) {
    this.configPath = configPath || path.join(process.cwd(), '.dzb-cv.config.json');
    this.config = { ...DEFAULT_CONFIG };
  }

  /**
   * Load configuration from file and environment variables
   */
  async load(): Promise<Config> {
    try {
      // Try to load from config file
      const configFile = await fs.readFile(this.configPath, 'utf-8');
      const fileConfig = JSON.parse(configFile) as Partial<Config>;
      
      // Merge with defaults
      this.config = this.mergeConfig(DEFAULT_CONFIG, fileConfig);
      console.log(`📋 Configuration loaded from ${this.configPath}`);
    } catch (error) {
      console.log('⚠️  No configuration file found, using defaults');
      this.config = { ...DEFAULT_CONFIG };
    }

    // Override with environment variables
    this.loadFromEnvironment();
    
    return this.config;
  }

  /**
   * Save current configuration to file
   */
  async save(): Promise<void> {
    try {
      await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 2));
      console.log(`💾 Configuration saved to ${this.configPath}`);
    } catch (error) {
      throw new Error(`Failed to save configuration: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get current configuration
   */
  get(): Config {
    return { ...this.config };
  }

  /**
   * Get AI configuration
   */
  getAI(): AIConfig {
    return { ...this.config.ai };
  }

  /**
   * Update AI configuration
   */
  updateAI(aiConfig: Partial<AIConfig>): void {
    this.config.ai = { ...this.config.ai, ...aiConfig };
  }

  /**
   * Get app configuration
   */
  getApp(): AppConfig {
    return { ...this.config.app };
  }

  /**
   * Update app configuration
   */
  updateApp(appConfig: Partial<AppConfig>): void {
    this.config.app = { ...this.config.app, ...appConfig };
  }

  /**
   * Get PDF configuration
   */
  getPDF(): PDFConfig {
    return { ...this.config.pdf };
  }

  /**
   * Update PDF configuration
   */
  updatePDF(pdfConfig: Partial<PDFConfig>): void {
    this.config.pdf = { ...this.config.pdf, ...pdfConfig };
  }

  /**
   * Initialize configuration with defaults
   */
  async initialize(): Promise<void> {
    try {
      await fs.access(this.configPath);
      console.log('📋 Configuration file exists');
    } catch {
      // Create default configuration file
      await this.save();
      console.log('✨ Created default configuration file');
    }
  }

  /**
   * Validate OpenAI API setup
   */
  validateOpenAI(): { valid: boolean; message: string } {
    const apiKey = process.env.OPENAI_API_KEY || this.config.ai.openai.apiKey;
    
    if (!apiKey) {
      return {
        valid: false,
        message: 'OpenAI API key not configured. Set OPENAI_API_KEY environment variable or update configuration.',
      };
    }

    if (apiKey === 'your_openai_api_key_here') {
      return {
        valid: false,
        message: 'OpenAI API key appears to be a placeholder. Please provide a valid API key.',
      };
    }

    if (!apiKey.startsWith('sk-')) {
      return {
        valid: false,
        message: 'OpenAI API key format appears invalid. Keys should start with "sk-".',
      };
    }

    return {
      valid: true,
      message: 'OpenAI API key is configured and appears valid.',
    };
  }

  /**
   * Load configuration from environment variables
   */
  private loadFromEnvironment(): void {
    // OpenAI configuration from environment
    if (process.env.OPENAI_API_KEY) {
      this.config.ai.openai.apiKey = process.env.OPENAI_API_KEY;
    }

    if (process.env.OPENAI_DISTILL_MODEL) {
      this.config.ai.openai.distillModel = process.env.OPENAI_DISTILL_MODEL;
    }

    if (process.env.OPENAI_OPTIMIZE_MODEL) {
      this.config.ai.openai.optimizeModel = process.env.OPENAI_OPTIMIZE_MODEL;
    }

    if (process.env.AI_ENABLED) {
      this.config.ai.enabled = process.env.AI_ENABLED.toLowerCase() === 'true';
    }

    if (process.env.AI_FALLBACK_MODE) {
      const fallbackMode = process.env.AI_FALLBACK_MODE as 'simulation' | 'error' | 'disable';
      if (['simulation', 'error', 'disable'].includes(fallbackMode)) {
        this.config.ai.fallbackMode = fallbackMode;
      }
    }

    // App configuration from environment
    if (process.env.CV_OUTPUT_PATH) {
      this.config.app.outputPath = process.env.CV_OUTPUT_PATH;
    }

    if (process.env.CV_TEMPLATES_PATH) {
      this.config.app.templatesPath = process.env.CV_TEMPLATES_PATH;
    }

    if (process.env.CV_DEFAULT_FORMAT) {
      const format = process.env.CV_DEFAULT_FORMAT as 'pdf' | 'markdown';
      if (['pdf', 'markdown'].includes(format)) {
        this.config.app.defaultFormat = format;
      }
    }
  }

  /**
   * Deep merge configuration objects
   */
  private mergeConfig(defaultConfig: Config, userConfig: Partial<Config>): Config {
    const merged = JSON.parse(JSON.stringify(defaultConfig)) as Config;

    if (userConfig.app) {
      merged.app = { ...merged.app, ...userConfig.app };
    }

    if (userConfig.pdf) {
      merged.pdf = { ...merged.pdf, ...userConfig.pdf };
      if (userConfig.pdf.pageConfig) {
        merged.pdf.pageConfig = { ...merged.pdf.pageConfig, ...userConfig.pdf.pageConfig };
        if (userConfig.pdf.pageConfig.margin) {
          merged.pdf.pageConfig.margin = { ...merged.pdf.pageConfig.margin, ...userConfig.pdf.pageConfig.margin };
        }
      }
    }

    if (userConfig.ai) {
      merged.ai = { ...merged.ai, ...userConfig.ai };
      if (userConfig.ai.openai) {
        merged.ai.openai = { ...merged.ai.openai, ...userConfig.ai.openai };
      }
      if (userConfig.ai.singlePageConstraints) {
        merged.ai.singlePageConstraints = { 
          ...merged.ai.singlePageConstraints, 
          ...userConfig.ai.singlePageConstraints 
        };
        if (userConfig.ai.singlePageConstraints.margins) {
          merged.ai.singlePageConstraints.margins = { 
            ...merged.ai.singlePageConstraints.margins, 
            ...userConfig.ai.singlePageConstraints.margins 
          };
        }
      }
    }

    return merged;
  }
}

// Create and export a singleton instance
export const configService = new ConfigurationService();
export default configService;
