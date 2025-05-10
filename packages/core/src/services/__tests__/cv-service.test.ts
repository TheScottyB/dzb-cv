import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest';
import type { CVData } from '@dzb-cv/types';

import { CVService } from '../cv-service.js';

interface Storage {
  save: (id: string, data: CVData) => Promise<void>;
  load: (id: string) => Promise<CVData>;
  delete: (id: string) => Promise<void>;
}

describe('CVService', () => {
  let service: CVService;
  let mockStorage: Mocked<Storage>;
  let mockPdfGenerator: {
    generate: (data: CVData, options?: unknown) => Promise<Buffer>;
  };
  const sampleCV: CVData = {
    personalInfo: {
      name: {
        first: 'John',
        last: 'Doe',
        full: 'John Doe',
      },
      contact: {
        email: 'john@example.com',
        phone: '123-456-7890', // Add required phone field
      },
    },
    experience: [],
    education: [],
    skills: [],
  };

  beforeEach(() => {
    mockStorage = {
      save: vi
        .fn()
        .mockImplementation((_id: string, _data: CVData): Promise<void> => Promise.resolve()),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      load: vi.fn().mockImplementation((id: string): Promise<CVData> => Promise.resolve(sampleCV)),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      delete: vi.fn().mockImplementation((id: string): Promise<void> => Promise.resolve()),
    };

    mockPdfGenerator = {
      generate: vi.fn().mockResolvedValue(Buffer.from('fake-pdf')),
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

  describe('getCV', () => {
    it('should retrieve CV data by id', async () => {
      const id = 'test-id';
      mockStorage.load.mockResolvedValue(sampleCV);

      const result = await service.getCV(id);

      expect(mockStorage.load).toHaveBeenCalledWith(id);
      expect(result).toEqual(sampleCV);
    });

    it('should throw error when CV not found', async () => {
      const id = 'non-existent-id';
      mockStorage.load.mockRejectedValue(new Error('CV not found'));

      await expect(service.getCV(id)).rejects.toThrow('CV not found');
    });
  });

  describe('updateCV', () => {
    it('should update existing CV with new data', async () => {
      const id = 'test-id';
      const existingCV = { ...sampleCV };
      const updateData = {
        personalInfo: {
          ...sampleCV.personalInfo,
          contact: {
            email: 'updated@example.com',
            phone: '987-654-3210', // Add required phone field
          },
        },
      };

      mockStorage.load.mockResolvedValue(existingCV);

       
      const _result = await service.updateCV(id, updateData);
      expect(mockStorage.load).toHaveBeenCalledWith(id);
      expect(mockStorage.load).toHaveBeenCalledWith(id);
      expect(mockStorage.save).toHaveBeenCalledWith(
        id,
        expect.objectContaining({
          personalInfo: expect.objectContaining({
            contact: expect.objectContaining({
              email: 'updated@example.com',
              phone: '987-654-3210',
            }),
          }),
        })
      );
    });

    it('should throw error when updating non-existent CV', async () => {
      const id = 'non-existent-id';
      mockStorage.load.mockRejectedValue(new Error('CV not found'));

      await expect(service.updateCV(id, {})).rejects.toThrow('CV not found');
    });

    it('should correctly merge nested properties', async () => {
      const id = 'test-id';
      const existingCV = {
        ...sampleCV,
        skills: [{ name: 'JavaScript' }, { name: 'TypeScript' }],
      };
      const updateData = {
        skills: [{ name: 'JavaScript' }, { name: 'TypeScript' }, { name: 'React' }],
      };

      mockStorage.load.mockResolvedValue(existingCV);

      const result = await service.updateCV(id, updateData);

      expect(result.skills).toEqual([
        { name: 'JavaScript' },
        { name: 'TypeScript' },
        { name: 'React' },
      ]);
      expect(result.personalInfo).toEqual(existingCV.personalInfo);
    });
  });

  describe('deleteCV', () => {
    it('should delete existing CV', async () => {
      const id = 'test-id';

      await service.deleteCV(id);

      expect(mockStorage.delete).toHaveBeenCalledWith(id);
    });

    it('should throw error when deleting non-existent CV', async () => {
      const id = 'non-existent-id';
      mockStorage.delete.mockRejectedValue(new Error('CV not found'));

      await expect(service.deleteCV(id)).rejects.toThrow('CV not found');
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = service['generateId']();
      const id2 = service['generateId']();

      expect(id1).toMatch(/^cv-\d+-[a-z0-9]+$/);
      expect(id2).toMatch(/^cv-\d+-[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });
  });
});
