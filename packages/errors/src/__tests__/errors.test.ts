// Error Handling Tests
// @version 1.0

import {
  BaseError,
  ConfigurationError,
  CVProcessingError,
  PDFGenerationError,
  ErrorHandler,
  createError,
} from '../index.js';

describe('BaseError', () => {
  test('should create error with all properties', () => {
    const context = { userId: '123', action: 'test' };
    const cause = new Error('Original error');
    const error = new BaseError('Test message', 'TEST_CODE', context, cause);

    expect(error.message).toBe('Test message');
    expect(error.code).toBe('TEST_CODE');
    expect(error.context).toEqual(context);
    expect(error.cause).toBe(cause);
    expect(error.timestamp).toBeInstanceOf(Date);
    expect(error.name).toBe('BaseError');
  });

  test('should serialize to JSON correctly', () => {
    const context = { test: 'value' };
    const cause = new Error('Cause error');
    const error = new BaseError('Test', 'CODE', context, cause);

    const json = error.toJSON();
    expect(json.name).toBe('BaseError');
    expect(json.message).toBe('Test');
    expect(json.code).toBe('CODE');
    expect(json.context).toEqual(context);
    expect(json.cause).toBe('Cause error');
    expect(typeof json.timestamp).toBe('string');
  });
});

describe('Specific Error Types', () => {
  test('ConfigurationError should extend BaseError', () => {
    const error = new ConfigurationError('Config missing');
    expect(error).toBeInstanceOf(BaseError);
    expect(error.code).toBe('CONFIG_ERROR');
    expect(error.name).toBe('ConfigurationError');
  });

  test('CVProcessingError should extend BaseError', () => {
    const error = new CVProcessingError('Processing failed');
    expect(error).toBeInstanceOf(BaseError);
    expect(error.code).toBe('CV_PROCESSING_ERROR');
    expect(error.name).toBe('CVProcessingError');
  });

  test('PDFGenerationError should extend BaseError', () => {
    const error = new PDFGenerationError('PDF generation failed');
    expect(error).toBeInstanceOf(BaseError);
    expect(error.code).toBe('PDF_GENERATION_ERROR');
    expect(error.name).toBe('PDFGenerationError');
  });
});

describe('Error Creation Helpers', () => {
  test('createError.config should create ConfigurationError', () => {
    const error = createError.config('Missing API key');
    expect(error).toBeInstanceOf(ConfigurationError);
    expect(error.message).toBe('Missing API key');
  });

  test('createError.missingConfig should create MissingConfigError', () => {
    const error = createError.missingConfig('API_KEY');
    expect(error.message).toContain('API_KEY');
    expect(error.context).toEqual({ configKey: 'API_KEY' });
  });

  test('createError.pdfGeneration should create PDFGenerationError', () => {
    const error = createError.pdfGeneration('Chrome not found');
    expect(error).toBeInstanceOf(PDFGenerationError);
    expect(error.message).toBe('Chrome not found');
  });
});

describe('ErrorHandler', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test('should handle BaseError instances', () => {
    const originalError = new ConfigurationError('Config error');
    const handled = ErrorHandler.handle(originalError);

    expect(handled).toBe(originalError);
    expect(consoleSpy).toHaveBeenCalled();
  });

  test('should handle regular Error instances', () => {
    const originalError = new Error('Regular error');
    const handled = ErrorHandler.handle(originalError);

    expect(handled).toBeInstanceOf(BaseError);
    expect(handled.message).toBe('Regular error');
    expect(handled.code).toBe('UNKNOWN_ERROR');
    expect(handled.cause).toBe(originalError);
  });

  test('should handle string errors', () => {
    const handled = ErrorHandler.handle('String error');

    expect(handled).toBeInstanceOf(BaseError);
    expect(handled.message).toBe('String error');
    expect(handled.code).toBe('STRING_ERROR');
  });

  test('should handle unknown error types', () => {
    const handled = ErrorHandler.handle({ unknown: 'object' });

    expect(handled).toBeInstanceOf(BaseError);
    expect(handled.message).toBe('An unknown error occurred');
    expect(handled.code).toBe('UNKNOWN_ERROR');
    expect(handled.context?.originalError).toEqual({ unknown: 'object' });
  });

  test('should handle async operations', async () => {
    const successPromise = Promise.resolve('success');
    const result = await ErrorHandler.handleAsync(successPromise);
    expect(result).toBe('success');

    const failPromise = Promise.reject(new Error('Async error'));
    await expect(ErrorHandler.handleAsync(failPromise)).rejects.toBeInstanceOf(BaseError);
  });

  test('should wrap functions with error handling', () => {
    const successFn = () => 'success';
    const wrappedSuccess = ErrorHandler.wrap(successFn);
    expect(wrappedSuccess()).toBe('success');

    const errorFn = () => { throw new Error('Function error'); };
    const wrappedError = ErrorHandler.wrap(errorFn);
    expect(() => wrappedError()).toThrow(BaseError);
  });
});