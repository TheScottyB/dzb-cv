import type { PDFTestContext, PDFTestResult } from './types';
import { createTestContext } from './test-utils';
import { join } from 'path';
import { createMockCVData } from './factories';

export const createPDFTestContext = async (): Promise<PDFTestContext> => {
  const baseContext = await createTestContext();
  const outputPath = join(baseContext.tempDir, 'output.pdf');
  
  return {
    ...baseContext,
    outputPath,
    sampleData: createMockCVData()
  };
};

export const validatePDFResult = async (result: PDFTestResult): Promise<boolean> => {
  if (!result.buffer || !(result.buffer instanceof Buffer)) {
    return false;
  }

  return (
    result.metadata.pageCount > 0 &&
    ['A4', 'Letter'].includes(result.metadata.format)
  );
};

export const comparePDFBuffers = async (actual: Buffer, expected: Buffer): Promise<boolean> => {
  // Basic comparison - in real implementation, you might want to use a PDF parsing library
  return actual.equals(expected);
};

