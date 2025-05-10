/**
 * Service factory for dependency injection
 */
import { CVService } from './cv-service.js';
import { MemoryStorage } from './storage/memory-storage.js';
import { PDFGeneratorImpl } from './pdf/pdf-generator-impl.js';
import type { CVStorageProvider } from './cv-service.js';
import type { PDFGenerator, PDFGenerationOptions } from './pdf/pdf-generator.js';

/**
 * Dependencies for CV service
 */
interface CVDependencies {
  storage?: CVStorageProvider;
  pdfGenerator?: PDFGenerator;
}

/**
 * Factory class to create and configure service instances
 */
export class ServiceFactory {
  /**
   * Create a CV service with default dependencies for development
   */
  static createCVService(): CVService {
    const storage = new MemoryStorage();
    const pdfGenerator = new PDFGeneratorImpl();
    return new CVService(storage, pdfGenerator);
  }

  /**
   * Create a CV service with custom dependencies
   */
  static createCustomCVService(dependencies: CVDependencies = {}): CVService {
    const storage = dependencies.storage || new MemoryStorage();
    const pdfGenerator = dependencies.pdfGenerator || new PDFGeneratorImpl();
    return new CVService(storage, pdfGenerator);
  }
}

// Export all services and providers
export * from './cv-service.js';
export * from './storage/memory-storage.js';
export * from './pdf/pdf-generator-impl.js';
export type { PDFGenerationOptions };
