// Mock implementation of puppeteer for testing
const puppeteer = {
  launch: jest.fn().mockResolvedValue({
    newPage: jest.fn().mockResolvedValue({
      setContent: jest.fn().mockResolvedValue(undefined),
      pdf: jest.fn().mockResolvedValue(Buffer.from('mock pdf content')),
      close: jest.fn().mockResolvedValue(undefined),
      evaluate: jest.fn().mockReturnValue(Promise.resolve('mock content'))
    }),
    close: jest.fn().mockResolvedValue(undefined)
  })
};

export default puppeteer; 