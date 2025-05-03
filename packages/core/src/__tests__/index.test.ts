import { describe, it, expect, vi } from 'vitest';
import { CVService } from '../index';
import type { CVData } from '@dzb-cv/types';

describe('Package exports', () => {
  it('should properly export CVService', () => {
    expect(CVService).toBeDefined();
    
    const mockStorage = {
      save: vi.fn(),
      load: vi.fn(),
      delete: vi.fn()
    };
    
    const mockPdfGenerator = {
      generate: vi.fn()
    };
    
    const service = new CVService(mockStorage, mockPdfGenerator);
    expect(service).toBeInstanceOf(CVService);
  });

  it('should maintain CVService functionality through barrel exports', async () => {
    const mockStorage = {
      save: vi.fn(),
      load: vi.fn().mockImplementation((id) => {
        if (id === 'test-id') {
          return Promise.resolve(testCV);
        }
        return Promise.reject(new Error('CV not found'));
      }),
      delete: vi.fn()
    };
    
    const mockPdfGenerator = {
      generate: vi.fn().mockResolvedValue(Buffer.from('mock-pdf-content'))
    };
    
    const service = new CVService(mockStorage, mockPdfGenerator);
    
    const testCV: CVData = {
      personalInfo: {
        name: {
          first: 'Test',
          last: 'Name',
          full: 'Test Name'
        },
        contact: {
          email: 'test@example.com'
        }
      },
      experience: [],
      education: [],
      skills: []
    };
    
    // Test that the service methods are properly exported and working
    const created = await service.createCV(testCV);
    expect(mockStorage.save).toHaveBeenCalledWith(expect.any(String), testCV);
    expect(created).toEqual(testCV);
    
    mockStorage.load.mockResolvedValue(testCV);
    const retrieved = await service.getCV('test-id');
    expect(mockStorage.load).toHaveBeenCalledWith('test-id');
    expect(retrieved).toEqual(testCV);
    
    await service.deleteCV('test-id');
    expect(mockStorage.delete).toHaveBeenCalledWith('test-id');
    
    // Test PDF generation
    await service.generatePDF(testCV);
    expect(mockPdfGenerator.generate).toHaveBeenCalledWith(testCV);
  });
});

