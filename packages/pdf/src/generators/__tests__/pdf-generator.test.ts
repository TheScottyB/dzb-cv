import { describe, it, expect } from 'vitest';
import type { CVData } from '@dzb-cv/types';

import { PDFGenerator } from '../pdf-generator.js';
import { sampleCV } from '../../test-utils';

describe('PDFGenerator', () => {
  const generator = new PDFGenerator();

  it('generates PDF with default options', async () => {
    const result = await generator.generate(sampleCV);
    expect(result).toBeInstanceOf(Buffer);
  });

  it('generates PDF with A4 format', async () => {
    const result = await generator.generate(sampleCV, { format: 'A4' }); // Changed from pageSize to format
    expect(result).toBeInstanceOf(Buffer);
  });

  it('generates PDF with custom margins', async () => {
    const margin = {
      // Changed from margins to margin
      top: 30,
      right: 30,
      bottom: 30,
      left: 30,
    };
    const result = await generator.generate(sampleCV, { margin }); // Changed from margins to margin
    expect(result).toBeInstanceOf(Buffer);
  });
});
