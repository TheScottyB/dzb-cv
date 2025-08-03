// Centralized Configuration Service
// @version 1.0

import { z } from 'zod';

// Environment validation schemas
const OpenAIConfigSchema = z.object({
  apiKey: z.string().min(1, 'OpenAI API key is required'),
  model: z.string().default('gpt-4o'),
  maxTokens: z.number().default(4000),
  temperature: z.number().min(0).max(2).default(0.7),
});

const ChromeConfigSchema = z.object({
  executablePath: z.string().optional(),
  debugUrl: z.string().url().default('http://localhost:9222'),
  headless: z.boolean().default(true),
  timeout: z.number().default(30000),
  args: z.array(z.string()).default([
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--single-process',
    '--disable-gpu'
  ]),
});

const ATSConfigSchema = z.object({
  scoreThreshold: z.number().min(0).max(100).default(70),
  keywordWeight: z.number().min(0).max(1).default(0.4),
  experienceWeight: z.number().min(0).max(1).default(0.3),
  educationWeight: z.number().min(0).max(1).default(0.3),
});

const AppConfigSchema = z.object({
  debug: z.boolean().default(false),
  verbose: z.boolean().default(false),
  logLevel: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  outputDir: z.string().default('./output'),
  templatesDir: z.string().default('./templates'),
});

// Main configuration schema
const ConfigSchema = z.object({
  openai: OpenAIConfigSchema,
  chrome: ChromeConfigSchema,
  ats: ATSConfigSchema,
  app: AppConfigSchema,
});

export type Config = z.infer<typeof ConfigSchema>;
export type OpenAIConfig = z.infer<typeof OpenAIConfigSchema>;
export type ChromeConfig = z.infer<typeof ChromeConfigSchema>;
export type ATSConfig = z.infer<typeof ATSConfigSchema>;
export type AppConfig = z.infer<typeof AppConfigSchema>;

// Configuration loading and validation
class ConfigurationService {
  private static instance: ConfigurationService;
  private config: Config;

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): ConfigurationService {
    if (!ConfigurationService.instance) {
      ConfigurationService.instance = new ConfigurationService();
    }
    return ConfigurationService.instance;
  }

  private loadConfig(): Config {
    // Load from environment variables with fallbacks
    const rawConfig = {
      openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
        model: process.env.OPENAI_MODEL || 'gpt-4o',
        maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4000'),
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
      },
      chrome: {
        executablePath: process.env.CHROME_EXECUTABLE_PATH,
        debugUrl: process.env.CHROME_DEBUG_URL || 'http://localhost:9222',
        headless: process.env.CHROME_HEADLESS !== 'false',
        timeout: parseInt(process.env.CHROME_TIMEOUT || '30000'),
        args: process.env.CHROME_ARGS?.split(',') || undefined,
      },
      ats: {
        scoreThreshold: parseInt(process.env.ATS_SCORE_THRESHOLD || '70'),
        keywordWeight: parseFloat(process.env.ATS_KEYWORD_WEIGHT || '0.4'),
        experienceWeight: parseFloat(process.env.ATS_EXPERIENCE_WEIGHT || '0.3'),
        educationWeight: parseFloat(process.env.ATS_EDUCATION_WEIGHT || '0.3'),
      },
      app: {
        debug: process.env.DEBUG === 'true',
        verbose: process.env.VERBOSE === 'true',
        logLevel: (process.env.LOG_LEVEL as any) || 'info',
        outputDir: process.env.OUTPUT_DIR || './output',
        templatesDir: process.env.TEMPLATES_DIR || './templates',
      },
    };

    try {
      return ConfigSchema.parse(rawConfig);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Configuration validation failed:');
        error.errors.forEach(err => {
          console.error(`  ${err.path.join('.')}: ${err.message}`);
        });
        throw new Error('Invalid configuration. Please check your environment variables.');
      }
      throw error;
    }
  }

  // Getters for different config sections
  public getOpenAIConfig(): OpenAIConfig {
    return this.config.openai;
  }

  public getChromeConfig(): ChromeConfig {
    return this.config.chrome;
  }

  public getATSConfig(): ATSConfig {
    return this.config.ats;
  }

  public getAppConfig(): AppConfig {
    return this.config.app;
  }

  // Full config getter
  public getConfig(): Config {
    return { ...this.config };
  }

  // Update config at runtime (useful for testing)
  public updateConfig(updates: Partial<Config>): void {
    this.config = ConfigSchema.parse({
      ...this.config,
      ...updates,
    });
  }

  // Environment info
  public isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  public isDevelopment(): boolean {
    return !this.isProduction();
  }

  public isDebugMode(): boolean {
    return this.config.app.debug || this.config.app.verbose;
  }
}

// Export singleton instance and factory function
export const config = ConfigurationService.getInstance();
export const getConfig = () => ConfigurationService.getInstance();

// Export individual config getters for convenience
export const getOpenAIConfig = () => config.getOpenAIConfig();
export const getChromeConfig = () => config.getChromeConfig();
export const getATSConfig = () => config.getATSConfig();
export const getAppConfig = () => config.getAppConfig();

// Configuration validation helper
export const validateConfig = (): boolean => {
  try {
    config.getConfig();
    return true;
  } catch {
    return false;
  }
};

// Export schemas for external validation
export {
  ConfigSchema,
  OpenAIConfigSchema,
  ChromeConfigSchema,
  ATSConfigSchema,
  AppConfigSchema,
};