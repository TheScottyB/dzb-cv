import type { CVData, PDFGenerator, PDFGenerationOptions } from '@dzb-cv/types';

export interface CVStorageProvider {
  save(id: string, data: CVData): Promise<void>;
  load(id: string): Promise<CVData>;
  delete(id: string): Promise<void>;
}

export class CVService {
  constructor(
    private storage: CVStorageProvider,
    private pdfGenerator: PDFGenerator
  ) {}

  async createCV(data: CVData): Promise<CVData> {
    const id = this.generateId();
    await this.storage.save(id, data);
    return data;
  }

  async getCV(id: string): Promise<CVData> {
    return this.storage.load(id);
  }

  async updateCV(id: string, data: Partial<CVData>): Promise<CVData> {
    const existing = await this.storage.load(id);
    const updated = { ...existing, ...data };
    await this.storage.save(id, updated);
    return updated;
  }

  async deleteCV(id: string): Promise<void> {
    await this.storage.delete(id);
  }

  async generatePDF(data: CVData, options?: PDFGenerationOptions): Promise<Buffer> {
    return this.pdfGenerator.generate(data, options);
  }

  private generateId(): string {
    return `cv-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}
