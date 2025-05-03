import type { PDFTestContext, PDFTestResult } from './types';
import { PDFDocument } from 'pdf-lib';
import { createTestContext } from './test-utils';
import { join } from 'path';
import { promises as fs } from 'fs';
import { createMockCVData } from './factories';

interface PDFSnapshotData {
  pageCount: number;
  dimensions: {
    width: number;
    height: number;
  };
  metadata: Record<string, string>;
}

export async function withPDFContext<T>(
  fn: (context: PDFTestContext) => Promise<T>
): Promise<T> {
  const baseContext = await createTestContext();
  const pdfContext: PDFTestContext = {
    ...baseContext,
    outputPath: join(baseContext.tempDir, 'output.pdf'),
    sampleData: createMockCVData()
  };

  try {
    return await fn(pdfContext);
  } finally {
    await pdfContext.cleanup();
  }
}

export async function createPDFSnapshot(
  pdfBuffer: Buffer
): Promise<PDFSnapshotData> {
  const doc = await PDFDocument.load(pdfBuffer);
  const page = doc.getPage(0);

  return {
    pageCount: doc.getPageCount(),
    dimensions: {
      width: page.getWidth(),
      height: page.getHeight()
    },
    metadata: {
      author: doc.getAuthor() || '',
      creator: doc.getCreator() || '',
      title: doc.getTitle() || ''
    }
  };
}

export async function comparePDFSnapshots(
  actual: PDFSnapshotData,
  expected: PDFSnapshotData
): Promise<boolean> {
  // Compare basic structure
  if (actual.pageCount !== expected.pageCount) return false;
  if (actual.dimensions.width !== expected.dimensions.width) return false;
  if (actual.dimensions.height !== expected.dimensions.height) return false;

  // Compare metadata
  const metadataKeys = Object.keys(expected.metadata);
  return metadataKeys.every(key => 
    actual.metadata[key] === expected.metadata[key]
  );
}

export async function loadPDFFixture(name: string): Promise<Buffer> {
  const fixturePath = join(process.cwd(), 'src/test/fixtures/pdfs', `${name}.pdf`);
  return fs.readFile(fixturePath);
}

export async function savePDFSnapshot(
  name: string,
  data: PDFSnapshotData
): Promise<void> {
  const snapshotDir = join(process.cwd(), 'src/test/snapshots/pdfs');
  await fs.mkdir(snapshotDir, { recursive: true });
  
  const snapshotPath = join(snapshotDir, `${name}.json`);
  await fs.writeFile(snapshotPath, JSON.stringify(data, null, 2));
}

export function expectValidPDF(result: PDFTestResult): void {
  expect(result.buffer).toBeInstanceOf(Buffer);
  expect(result.metadata.pageCount).toBeGreaterThan(0);
  expect(['A4', 'Letter']).toContain(result.metadata.format);
}

export function expectPDFToMatch(
  actual: PDFTestResult,
  expected: PDFTestResult
): void {
  expect(actual.buffer.length).toBeGreaterThan(0);
  expect(actual.metadata.pageCount).toBe(expected.metadata.pageCount);
  expect(actual.metadata.format).toBe(expected.metadata.format);
  
  if (expected.metadata.title) {
    expect(actual.metadata.title).toBe(expected.metadata.title);
  }
}

