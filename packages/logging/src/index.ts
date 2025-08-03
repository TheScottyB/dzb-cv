// Centralized Logging Service
// @version 1.0

// import { getAppConfig } from '@dzb-cv/configuration';

// Temporary config interface until configuration package is available
interface AppConfig {
  debug: boolean;
  verbose: boolean;
  logLevel: string;
  isProduction?(): boolean;
}

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  component: string;
  message: string;
  data?: unknown;
  context?: Record<string, unknown>;
}

export interface LoggerOptions {
  component: string;
  enabled?: boolean;
  minLevel?: LogLevel;
  includeTimestamp?: boolean;
  includeComponent?: boolean;
  colorize?: boolean;
}

export class Logger {
  private component: string;
  private enabled: boolean;
  private minLevel: LogLevel;
  private includeTimestamp: boolean;
  private includeComponent: boolean;
  private colorize: boolean;

  constructor(options: LoggerOptions) {
    // Temporary fallback config until configuration package is integrated
    const appConfig: AppConfig = {
      debug: process.env.DEBUG === 'true',
      verbose: process.env.VERBOSE === 'true',
      logLevel: process.env.LOG_LEVEL || 'info',
      isProduction: () => process.env.NODE_ENV === 'production',
    };
    
    this.component = options.component;
    this.enabled = options.enabled ?? true;
    this.minLevel = options.minLevel ?? this.getLogLevelFromConfig(appConfig.logLevel);
    this.includeTimestamp = options.includeTimestamp ?? true;
    this.includeComponent = options.includeComponent ?? true;
    this.colorize = options.colorize ?? !appConfig.isProduction?.();
  }

  /**
   * Log error message
   */
  public error(message: string, data?: unknown, context?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, data, context);
  }

  /**
   * Log warning message
   */
  public warn(message: string, data?: unknown, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, data, context);
  }

  /**
   * Log info message
   */
  public info(message: string, data?: unknown, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, data, context);
  }

  /**
   * Log debug message
   */
  public debug(message: string, data?: unknown, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, data, context);
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, data?: unknown, context?: Record<string, unknown>): void {
    if (!this.enabled || level > this.minLevel) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      component: this.component,
      message,
      data,
      context,
    };

    this.output(entry);
  }

  /**
   * Output log entry to console
   */
  private output(entry: LogEntry): void {
    const parts: string[] = [];

    // Timestamp
    if (this.includeTimestamp) {
      const timestamp = entry.timestamp.toISOString();
      parts.push(this.colorize ? this.colors.gray(timestamp) : timestamp);
    }

    // Log level
    const levelName = LogLevel[entry.level];
    const colorizedLevel = this.colorize ? this.colorizeLevel(levelName, entry.level) : levelName;
    parts.push(`[${colorizedLevel}]`);

    // Component
    if (this.includeComponent) {
      const component = this.colorize ? this.colors.blue(entry.component) : entry.component;
      parts.push(`[${component}]`);
    }

    // Message
    parts.push(entry.message);

    const logLine = parts.join(' ');

    // Output to appropriate console method
    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(logLine, entry.data, entry.context);
        break;
      case LogLevel.WARN:
        console.warn(logLine, entry.data, entry.context);
        break;
      case LogLevel.INFO:
        console.info(logLine, entry.data, entry.context);
        break;
      case LogLevel.DEBUG:
        console.debug(logLine, entry.data, entry.context);
        break;
    }
  }

  /**
   * Colorize log level for console output
   */
  private colorizeLevel(levelName: string, level: LogLevel): string {
    switch (level) {
      case LogLevel.ERROR:
        return this.colors.red(levelName);
      case LogLevel.WARN:
        return this.colors.yellow(levelName);
      case LogLevel.INFO:
        return this.colors.green(levelName);
      case LogLevel.DEBUG:
        return this.colors.cyan(levelName);
      default:
        return levelName;
    }
  }

  /**
   * Simple color helpers
   */
  private colors = {
    red: (text: string) => `\\x1b[31m${text}\\x1b[0m`,
    yellow: (text: string) => `\\x1b[33m${text}\\x1b[0m`,
    green: (text: string) => `\\x1b[32m${text}\\x1b[0m`,
    blue: (text: string) => `\\x1b[34m${text}\\x1b[0m`,
    cyan: (text: string) => `\\x1b[36m${text}\\x1b[0m`,
    gray: (text: string) => `\\x1b[90m${text}\\x1b[0m`,
  };

  /**
   * Convert string log level to enum
   */
  private getLogLevelFromConfig(logLevel: string): LogLevel {
    switch (logLevel.toLowerCase()) {
      case 'error':
        return LogLevel.ERROR;
      case 'warn':
        return LogLevel.WARN;
      case 'info':
        return LogLevel.INFO;
      case 'debug':
        return LogLevel.DEBUG;
      default:
        return LogLevel.INFO;
    }
  }

  /**
   * Update logger configuration
   */
  public updateConfig(options: Partial<LoggerOptions>): void {
    if (options.enabled !== undefined) this.enabled = options.enabled;
    if (options.minLevel !== undefined) this.minLevel = options.minLevel;
    if (options.includeTimestamp !== undefined) this.includeTimestamp = options.includeTimestamp;
    if (options.includeComponent !== undefined) this.includeComponent = options.includeComponent;
    if (options.colorize !== undefined) this.colorize = options.colorize;
  }

  /**
   * Get current configuration
   */
  public getConfig(): LoggerOptions {
    return {
      component: this.component,
      enabled: this.enabled,
      minLevel: this.minLevel,
      includeTimestamp: this.includeTimestamp,
      includeComponent: this.includeComponent,
      colorize: this.colorize,
    };
  }
}

// Logger factory
export class LoggerFactory {
  private static loggers = new Map<string, Logger>();

  /**
   * Get or create logger for component
   */
  public static getLogger(component: string, options?: Partial<LoggerOptions>): Logger {
    const existing = this.loggers.get(component);
    if (existing) {
      if (options) {
        existing.updateConfig(options);
      }
      return existing;
    }

    const logger = new Logger({ component, ...options });
    this.loggers.set(component, logger);
    return logger;
  }

  /**
   * Update all loggers configuration
   */
  public static updateAllLoggers(options: Partial<LoggerOptions>): void {
    this.loggers.forEach(logger => logger.updateConfig(options));
  }

  /**
   * Get all registered loggers
   */
  public static getAllLoggers(): Map<string, Logger> {
    return new Map(this.loggers);
  }

  /**
   * Clear all loggers (useful for testing)
   */
  public static clearLoggers(): void {
    this.loggers.clear();
  }
}

// Convenience function for creating loggers
export const createLogger = (component: string, options?: Partial<LoggerOptions>): Logger => {
  return LoggerFactory.getLogger(component, options);
};

// Pre-configured loggers for common components
export const loggers = {
  cv: createLogger('CV'),
  ats: createLogger('ATS'),
  pdf: createLogger('PDF'),
  config: createLogger('Config'),
  error: createLogger('Error'),
  job: createLogger('Job'),
  agent: createLogger('Agent'),
  template: createLogger('Template'),
  cli: createLogger('CLI'),
};

// Export commonly used logger
export const logger = createLogger('App');

// Legacy console replacement helpers
export const log = {
  error: (message: string, ...args: unknown[]) => logger.error(message, args.length === 1 ? args[0] : args),
  warn: (message: string, ...args: unknown[]) => logger.warn(message, args.length === 1 ? args[0] : args),
  info: (message: string, ...args: unknown[]) => logger.info(message, args.length === 1 ? args[0] : args),
  debug: (message: string, ...args: unknown[]) => logger.debug(message, args.length === 1 ? args[0] : args),
};