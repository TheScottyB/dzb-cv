import type { PDFSnapshotData } from './types';
import { promises as fs } from 'fs';
import { join } from 'path';
import { createPDFValidationError } from './validation-error';

export async function loadPDFSnapshot(name: string): Promise<PDFSnapshotData> {
  const snapshotPath = join(process.cwd(), 'src/test/snapshots/pdfs', `${name}.json`);
  const content = await fs.readFile(snapshotPath, 'utf-8');
  return JSON.parse(content);
}

export async function comparePDFWithSnapshot(
  actual: PDFSnapshotData,
  snapshotName: string
): Promise<void> {
  const expected = await loadPDFSnapshot(snapshotName);

  // Compare dimensions
  if (actual.dimensions.width !== expected.dimensions.width ||
      actual.dimensions.height !== expected.dimensions.height) {
    throw createPDFValidationError(
      'dimensions',
      expected.dimensions,
      actual.dimensions
    );
  }

  // Compare page count
  if (actual.pageCount !== expected.pageCount) {
    throw createPDFValidationError(
      'pageCount',
      expected.pageCount,
      actual.pageCount
    );
  }

  // Compare metadata
  for (const [key, value] of Object.entries(expected.metadata)) {
    if (actual.metadata[key] !== value) {
      throw createPDFValidationError(
        `metadata.${key}`,
        value,
        actual.metadata[key]
      );
    }
  }
}

export function toMatchPDFSnapshot(
  received: PDFSnapshotData,
  snapshotName: string
): { pass: boolean; message(): string } {
  try {
    comparePDFWithSnapshot(received, snapshotName);
    return {
      pass: true,
      message: () => `PDF matches snapshot ${snapshotName}`
    };
  } catch (error) {
    if (error instanceof PDFValidationError) {
      return {
        pass: false,
        message: () => error.toString()
      };
    }
    throw error;
  }
}

