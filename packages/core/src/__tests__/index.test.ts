import { describe, it, expect, vi } from 'vitest';
import { sampleCV, createMockStorage, createMockPdfGenerator } from '../test-utils';

import { CVService } from '../index.js';

describe('Package exports', () => {
  it('should properly export CVService', () => {
    expect(CVService).toBeDefined();

    const mockStorage = createMockStorage();
    const mockPdfGenerator = createMockPdfGenerator();

    const service = new CVService(mockStorage, mockPdfGenerator);
    expect(service).toBeInstanceOf(CVService);
  });

  it('should maintain CVService functionality through barrel exports', async () => {
    const mockStorage = createMockStorage();
    const mockPdfGenerator = createMockPdfGenerator();

    const service = new CVService(mockStorage, mockPdfGenerator);

    const created = await service.createCV(sampleCV);
    expect(mockStorage.save).toHaveBeenCalledWith(expect.any(String), sampleCV);
    expect(created).toEqual(sampleCV);

    mockStorage.load.mockResolvedValue(sampleCV);
    const retrieved = await service.getCV('test-id');
    expect(mockStorage.load).toHaveBeenCalledWith('test-id');
    expect(retrieved).toEqual(sampleCV);

    await service.deleteCV('test-id');
    expect(mockStorage.delete).toHaveBeenCalledWith('test-id');

    // Test PDF generation
    await service.generatePDF(sampleCV);
    expect(mockPdfGenerator.generate).toHaveBeenCalledWith(sampleCV);
  });
});
