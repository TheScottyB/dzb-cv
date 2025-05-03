import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CVService } from '../cv-service';
import type { CVData } from '@dzb-cv/types';

describe('CVService', () => {
  let service: CVService;
  let mockStorage: {
    save: any;
    load: any;
    delete: any;
  };
  let mockPdfGenerator: {
    generate: any;
  };

  const sampleCV: CVData = {
    personalInfo: {
      name: {
        first: 'John',
        last: 'Doe',
        full: 'John Doe'
      },
      contact: {
        email: 'john@example.com'
      }
    },
    experience: [],
    education: [],
    skills: []
  };

  beforeEach(() => {
    mockStorage = {
      save: vi.fn(),
      load: vi.fn(),
      delete: vi.fn()
    };

    mockPdfGenerator = {
      generate: vi.fn()
    };

    service = new CVService(mockStorage, mockPdfGenerator);
  });

  describe('createCV', () => {
    it('should save CV data', async () => {
      await service.createCV(sampleCV);
      expect(mockStorage.save).toHaveBeenCalledWith(expect.any(String), sampleCV);
    });

    it('should return the created CV data', async () => {
      const result = await service.createCV(sampleCV);
      expect(result).toEqual(sampleCV);
    });
  });

  describe('generatePDF', () => {
    it('should generate PDF from CV data', async () => {
      await service.generatePDF(sampleCV);
      expect(mockPdfGenerator.generate).toHaveBeenCalledWith(sampleCV);
    });
  });
});
