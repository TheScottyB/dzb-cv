// Logging Service Tests
// @version 1.0

import { Logger, LogLevel, LoggerFactory, createLogger } from '../index.js';

describe('Logger', () => {
  let originalConsole: Console;
  let mockConsole: {
    error: jest.fn;
    warn: jest.fn;
    info: jest.fn;
    debug: jest.fn;
  };

  beforeEach(() => {
    originalConsole = global.console;
    mockConsole = {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
    };
    global.console = mockConsole as any;
  });

  afterEach(() => {
    global.console = originalConsole;
    LoggerFactory.clearLoggers();
  });

  describe('Logger creation', () => {
    test('should create logger with default options', () => {
      const logger = new Logger({ component: 'Test' });
      expect(logger.getConfig().component).toBe('Test');
      expect(logger.getConfig().enabled).toBe(true);
    });

    test('should create logger with custom options', () => {
      const logger = new Logger({
        component: 'Custom',
        enabled: false,
        minLevel: LogLevel.ERROR,
        colorize: false,
      });

      const config = logger.getConfig();
      expect(config.component).toBe('Custom');
      expect(config.enabled).toBe(false);
      expect(config.minLevel).toBe(LogLevel.ERROR);
      expect(config.colorize).toBe(false);
    });
  });

  describe('Logging functionality', () => {
    test('should log error messages', () => {
      const logger = new Logger({ component: 'Test' });
      logger.error('Test error message');
      
      expect(mockConsole.error).toHaveBeenCalled();
      expect(mockConsole.error.mock.calls[0][0]).toContain('[ERROR]');
      expect(mockConsole.error.mock.calls[0][0]).toContain('[Test]');
      expect(mockConsole.error.mock.calls[0][0]).toContain('Test error message');
    });

    test('should respect minimum log level', () => {
      const logger = new Logger({
        component: 'Test',
        minLevel: LogLevel.ERROR,
      });

      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warn message');
      logger.error('Error message');

      expect(mockConsole.debug).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.warn).not.toHaveBeenCalled();
      expect(mockConsole.error).toHaveBeenCalled();
    });

    test('should not log when disabled', () => {
      const logger = new Logger({
        component: 'Test',
        enabled: false,
      });

      logger.error('Error message');
      logger.warn('Warn message');
      logger.info('Info message');
      logger.debug('Debug message');

      expect(mockConsole.error).not.toHaveBeenCalled();
      expect(mockConsole.warn).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.debug).not.toHaveBeenCalled();
    });
  });

  describe('LoggerFactory', () => {
    test('should create and cache loggers', () => {
      const logger1 = LoggerFactory.getLogger('Component1');
      const logger2 = LoggerFactory.getLogger('Component1');
      const logger3 = LoggerFactory.getLogger('Component2');

      expect(logger1).toBe(logger2); // Same instance
      expect(logger1).not.toBe(logger3); // Different instances
    });

    test('should update existing logger config', () => {
      const logger = LoggerFactory.getLogger('Test', { enabled: true });
      expect(logger.getConfig().enabled).toBe(true);

      LoggerFactory.getLogger('Test', { enabled: false });
      expect(logger.getConfig().enabled).toBe(false);
    });

    test('should update all loggers configuration', () => {
      const logger1 = LoggerFactory.getLogger('Test1');
      const logger2 = LoggerFactory.getLogger('Test2');

      LoggerFactory.updateAllLoggers({ enabled: false });

      expect(logger1.getConfig().enabled).toBe(false);
      expect(logger2.getConfig().enabled).toBe(false);
    });
  });

  describe('createLogger convenience function', () => {
    test('should create logger using convenience function', () => {
      const logger = createLogger('TestComponent');
      expect(logger.getConfig().component).toBe('TestComponent');
    });
  });
});

describe('LogLevel enum', () => {
  test('should have correct numeric values', () => {
    expect(LogLevel.ERROR).toBe(0);
    expect(LogLevel.WARN).toBe(1);
    expect(LogLevel.INFO).toBe(2);
    expect(LogLevel.DEBUG).toBe(3);
  });
});