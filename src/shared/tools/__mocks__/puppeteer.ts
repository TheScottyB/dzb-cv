const mockPage = {
  goto: jest.fn(),
  setViewport: jest.fn(),
  setUserAgent: jest.fn(),
  setCookie: jest.fn(),
  content: jest.fn().mockResolvedValue('<html><body>Mock content</body></html>'),
  title: jest.fn().mockResolvedValue('Mock Job Title'),
  screenshot: jest.fn(),
  pdf: jest.fn(),
  evaluate: jest.fn().mockImplementation((fn) => {
    // Mock evaluate to return basic job data
    return Promise.resolve({
      title: 'Mock Job Title',
      company: 'Mock Company',
      location: 'Mock Location',
      description: 'Mock job description',
      responsibilities: ['Mock responsibility 1', 'Mock responsibility 2'],
      qualifications: ['Mock qualification 1', 'Mock qualification 2']
    });
  })
};

const mockBrowser = {
  newPage: jest.fn().mockResolvedValue(mockPage),
  close: jest.fn(),
  disconnect: jest.fn()
};

export default {
  launch: jest.fn().mockResolvedValue(mockBrowser),
  connect: jest.fn().mockResolvedValue(mockBrowser)
}; 