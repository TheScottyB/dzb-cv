// Centralized Error Handling System
// @version 1.0

// Base error class with enhanced context
export class BaseError extends Error {
  public readonly code: string;
  public readonly timestamp: Date;
  public readonly context?: Record<string, unknown>;
  public readonly cause?: Error;

  constructor(
    message: string,
    code: string,
    context?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.timestamp = new Date();
    this.context = context;
    this.cause = cause;

    // Maintains proper stack trace for V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  public toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      stack: this.stack,
      cause: this.cause?.message,
    };
  }
}

// Configuration-related errors
export class ConfigurationError extends BaseError {
  constructor(message: string, context?: Record<string, unknown>, cause?: Error) {
    super(message, 'CONFIG_ERROR', context, cause);
  }
}

export class MissingConfigError extends ConfigurationError {
  constructor(configKey: string, cause?: Error) {
    super(
      `Missing required configuration: ${configKey}`,
      { configKey },
      cause
    );
  }
}

export class InvalidConfigError extends ConfigurationError {
  constructor(configKey: string, expectedType: string, actualValue: unknown, cause?: Error) {
    super(
      `Invalid configuration for ${configKey}. Expected ${expectedType}, got ${typeof actualValue}`,
      { configKey, expectedType, actualValue },
      cause
    );
  }
}

// CV Processing errors
export class CVProcessingError extends BaseError {
  constructor(message: string, context?: Record<string, unknown>, cause?: Error) {
    super(message, 'CV_PROCESSING_ERROR', context, cause);
  }
}

export class ProfileValidationError extends CVProcessingError {
  constructor(field: string, reason: string, cause?: Error) {
    super(
      `Profile validation failed for field '${field}': ${reason}`,
      { field, reason },
      cause
    );
  }
}

export class TemplateError extends CVProcessingError {
  constructor(templateId: string, reason: string, cause?: Error) {
    super(
      `Template error for '${templateId}': ${reason}`,
      { templateId, reason },
      cause
    );
  }
}

// PDF Generation errors
export class PDFGenerationError extends BaseError {
  constructor(message: string, context?: Record<string, unknown>, cause?: Error) {
    super(message, 'PDF_GENERATION_ERROR', context, cause);
  }
}

export class ChromeNotFoundError extends PDFGenerationError {
  constructor(searchPaths?: string[], cause?: Error) {
    super(
      'Chrome browser not found. Please install Chrome or set CHROME_EXECUTABLE_PATH',
      { searchPaths },
      cause
    );
  }
}

export class PDFRenderError extends PDFGenerationError {
  constructor(reason: string, htmlContent?: string, cause?: Error) {
    super(
      `PDF rendering failed: ${reason}`,
      { reason, htmlContentLength: htmlContent?.length },
      cause
    );
  }
}

// ATS Analysis errors
export class ATSAnalysisError extends BaseError {
  constructor(message: string, context?: Record<string, unknown>, cause?: Error) {
    super(message, 'ATS_ANALYSIS_ERROR', context, cause);
  }
}

export class JobPostingParseError extends ATSAnalysisError {
  constructor(source: string, reason: string, cause?: Error) {
    super(
      `Failed to parse job posting from ${source}: ${reason}`,
      { source, reason },
      cause
    );
  }
}

export class ScoringError extends ATSAnalysisError {
  constructor(scoringType: string, reason: string, cause?: Error) {
    super(
      `Scoring failed for ${scoringType}: ${reason}`,
      { scoringType, reason },
      cause
    );
  }
}

// API and Network errors
export class APIError extends BaseError {
  public readonly statusCode?: number;
  public readonly apiEndpoint?: string;

  constructor(
    message: string,
    statusCode?: number,
    apiEndpoint?: string,
    context?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message, 'API_ERROR', { ...context, statusCode, apiEndpoint }, cause);
    this.statusCode = statusCode;
    this.apiEndpoint = apiEndpoint;
  }
}

export class OpenAIAPIError extends APIError {
  constructor(message: string, statusCode?: number, cause?: Error) {
    super(message, statusCode, 'OpenAI API', { service: 'OpenAI' }, cause);
  }
}

export class RateLimitError extends APIError {
  public readonly retryAfter?: number;

  constructor(service: string, retryAfter?: number, cause?: Error) {
    super(
      `Rate limit exceeded for ${service}${retryAfter ? `. Retry after ${retryAfter}s` : ''}`,
      429,
      service,
      { retryAfter },
      cause
    );
    this.retryAfter = retryAfter;
  }
}

// File System errors
export class FileSystemError extends BaseError {
  public readonly filePath?: string;
  public readonly operation?: string;

  constructor(
    message: string,
    filePath?: string,
    operation?: string,
    cause?: Error
  ) {
    super(message, 'FILE_SYSTEM_ERROR', { filePath, operation }, cause);
    this.filePath = filePath;
    this.operation = operation;
  }
}

export class FileNotFoundError extends FileSystemError {
  constructor(filePath: string, cause?: Error) {
    super(`File not found: ${filePath}`, filePath, 'read', cause);
  }
}

export class FileWriteError extends FileSystemError {
  constructor(filePath: string, reason: string, cause?: Error) {
    super(`Failed to write file ${filePath}: ${reason}`, filePath, 'write', cause);
  }
}

// Agent/Message Bus errors
export class AgentError extends BaseError {
  public readonly agentName?: string;

  constructor(
    message: string,
    agentName?: string,
    context?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message, 'AGENT_ERROR', { ...context, agentName }, cause);
    this.agentName = agentName;
  }
}

export class MessageBusError extends AgentError {
  constructor(message: string, context?: Record<string, unknown>, cause?: Error) {
    super(message, 'MessageBus', context, cause);
  }
}

// Validation errors
export class ValidationError extends BaseError {
  public readonly field?: string;
  public readonly value?: unknown;

  constructor(
    message: string,
    field?: string,
    value?: unknown,
    cause?: Error
  ) {
    super(message, 'VALIDATION_ERROR', { field, value }, cause);
    this.field = field;
    this.value = value;
  }
}

// Error handler utilities
export class ErrorHandler {
  private static logError(error: BaseError | Error): void {
    if (error instanceof BaseError) {
      console.error(`[${error.code}] ${error.message}`, {
        timestamp: error.timestamp,
        context: error.context,
        cause: error.cause?.message,
      });
    } else {
      console.error(`[UNKNOWN_ERROR] ${error.message}`, {
        name: error.name,
        stack: error.stack,
      });
    }
  }

  public static handle(error: unknown): BaseError {
    let processedError: BaseError;

    if (error instanceof BaseError) {
      processedError = error;
    } else if (error instanceof Error) {
      processedError = new BaseError(
        error.message,
        'UNKNOWN_ERROR',
        { originalName: error.name },
        error
      );
    } else if (typeof error === 'string') {
      processedError = new BaseError(error, 'STRING_ERROR');
    } else {
      processedError = new BaseError(
        'An unknown error occurred',
        'UNKNOWN_ERROR',
        { originalError: error }
      );
    }

    this.logError(processedError);
    return processedError;
  }

  public static async handleAsync<T>(
    promise: Promise<T>,
    context?: Record<string, unknown>
  ): Promise<T> {
    try {
      return await promise;
    } catch (error) {
      const processedError = this.handle(error);
      if (context) {
        Object.assign(processedError.context || {}, context);
      }
      throw processedError;
    }
  }

  public static wrap<T extends any[], R>(
    fn: (...args: T) => R,
    context?: Record<string, unknown>
  ): (...args: T) => R {
    return (...args: T): R => {
      try {
        return fn(...args);
      } catch (error) {
        const processedError = this.handle(error);
        if (context) {
          Object.assign(processedError.context || {}, context);
        }
        throw processedError;
      }
    };
  }
}

// Error type guards
export const isBaseError = (error: unknown): error is BaseError => {
  return error instanceof BaseError;
};

export const isConfigurationError = (error: unknown): error is ConfigurationError => {
  return error instanceof ConfigurationError;
};

export const isPDFGenerationError = (error: unknown): error is PDFGenerationError => {
  return error instanceof PDFGenerationError;
};

export const isAPIError = (error: unknown): error is APIError => {
  return error instanceof APIError;
};

export const isFileSystemError = (error: unknown): error is FileSystemError => {
  return error instanceof FileSystemError;
};

// Export error creation helpers
export const createError = {
  config: (message: string, context?: Record<string, unknown>, cause?: Error) =>
    new ConfigurationError(message, context, cause),
  
  missingConfig: (key: string, cause?: Error) =>
    new MissingConfigError(key, cause),
  
  invalidConfig: (key: string, expectedType: string, actualValue: unknown, cause?: Error) =>
    new InvalidConfigError(key, expectedType, actualValue, cause),
  
  cvProcessing: (message: string, context?: Record<string, unknown>, cause?: Error) =>
    new CVProcessingError(message, context, cause),
  
  profileValidation: (field: string, reason: string, cause?: Error) =>
    new ProfileValidationError(field, reason, cause),
  
  template: (templateId: string, reason: string, cause?: Error) =>
    new TemplateError(templateId, reason, cause),
  
  pdfGeneration: (message: string, context?: Record<string, unknown>, cause?: Error) =>
    new PDFGenerationError(message, context, cause),
  
  chromeNotFound: (searchPaths?: string[], cause?: Error) =>
    new ChromeNotFoundError(searchPaths, cause),
  
  pdfRender: (reason: string, htmlContent?: string, cause?: Error) =>
    new PDFRenderError(reason, htmlContent, cause),
  
  atsAnalysis: (message: string, context?: Record<string, unknown>, cause?: Error) =>
    new ATSAnalysisError(message, context, cause),
  
  jobPostingParse: (source: string, reason: string, cause?: Error) =>
    new JobPostingParseError(source, reason, cause),
  
  scoring: (type: string, reason: string, cause?: Error) =>
    new ScoringError(type, reason, cause),
  
  api: (message: string, statusCode?: number, endpoint?: string, context?: Record<string, unknown>, cause?: Error) =>
    new APIError(message, statusCode, endpoint, context, cause),
  
  openaiAPI: (message: string, statusCode?: number, cause?: Error) =>
    new OpenAIAPIError(message, statusCode, cause),
  
  rateLimit: (service: string, retryAfter?: number, cause?: Error) =>
    new RateLimitError(service, retryAfter, cause),
  
  fileSystem: (message: string, filePath?: string, operation?: string, cause?: Error) =>
    new FileSystemError(message, filePath, operation, cause),
  
  fileNotFound: (filePath: string, cause?: Error) =>
    new FileNotFoundError(filePath, cause),
  
  fileWrite: (filePath: string, reason: string, cause?: Error) =>
    new FileWriteError(filePath, reason, cause),
  
  agent: (message: string, agentName?: string, context?: Record<string, unknown>, cause?: Error) =>
    new AgentError(message, agentName, context, cause),
  
  messageBus: (message: string, context?: Record<string, unknown>, cause?: Error) =>
    new MessageBusError(message, context, cause),
  
  validation: (message: string, field?: string, value?: unknown, cause?: Error) =>
    new ValidationError(message, field, value, cause),
};