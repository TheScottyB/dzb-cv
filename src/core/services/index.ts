/**
 * Service factory for dependency injection
 */
import { CVService } from './cv-service.js';
import { MemoryStorage } from './storage/memory-storage.js';
import { MockPDFGenerator } from './pdf/mock-pdf-generator.js';

/**
 * Factory class to create and configure service instances
 */
export class ServiceFactory {
  /**
   * Create a CV service with default dependencies for development
   */
  static createCVService(): CVService {
    const storage = new MemoryStorage();
    const pdfGenerator = new MockPDFGenerator();
    return new CVService(storage, pdfGenerator);
  }

  /**
   * Create a CV service with custom dependencies
   */
  static createCustomCVService(dependencies: {
    storage?: any,
    pdfGenerator?: any
  }): CVService {
    const storage = dependencies.storage || new MemoryStorage();
    const pdfGenerator = dependencies.pdfGenerator || new MockPDFGenerator();
    return new CVService(storage, pdfGenerator);
  }
}

// Export all services and providers
export * from './cv-service.js';
export * from './storage/memory-storage.js';
export * from './pdf/mock-pdf-generator.js';

