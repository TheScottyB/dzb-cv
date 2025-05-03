export interface PDFSnapshotData {
  pageCount: number;
  dimensions: {
    width: number;
    height: number;
  };
  metadata: Record<string, string>;
  content?: {
    sections?: string[];
    requiredText?: string[];
  };
}

export interface PDFTestFixture {
  name: string;
  path: string;
  snapshotPath: string;
  metadata: {
    title: string;
    author: string;
    creator: string;
    format: 'A4' | 'Letter';
  };
}

