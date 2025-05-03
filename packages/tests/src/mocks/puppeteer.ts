import { vi } from 'vitest';

// Create mock page functions with proper initialization
export const mockPage = {
  url: vi.fn().mockReturnValue('https://example.com/test-job'),
  goto: vi.fn().mockResolvedValue(null),
  evaluate: vi.fn().mockResolvedValue({}),
  close: vi.fn().mockResolvedValue(null),
  content: vi.fn().mockResolvedValue('<html><body>Test content</body></html>'),
  $eval: vi.fn().mockImplementation(async (selector: string, callback: Function) => {
    const element = {
      textContent: 'Test content',
      innerHTML: 'Test content'
    };
    return callback(element);
  }),
  $$eval: vi.fn().mockImplementation(async (selector: string, callback: Function) => {
    const elements = [
      { textContent: 'Test item 1', innerHTML: 'Test item 1' },
      { textContent: 'Test item 2', innerHTML: 'Test item 2' }
    ];
    return callback(elements);
  })
};

// Create mock browser
export const mockBrowser = {
  newPage: vi.fn().mockResolvedValue(mockPage),
  close: vi.fn().mockResolvedValue(null)
};

// Export mocked functions
export const launch = vi.fn().mockResolvedValue(mockBrowser);
export const connect = vi.fn().mockResolvedValue(mockBrowser);

// Default export
export default {
  launch,
  connect,
  mockPage,
  mockBrowser
};

