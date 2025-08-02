import { describe, it, expect, vi } from 'vitest';
import { printVerificationResults } from '../pdf-verifier';
import type { PDFVerificationResult } from '../pdf-verifier';

// Skip verifyPDF tests due to complex external tool dependencies
// Focus on testing the parts we can control

describe('PDF Verifier', () => {
  describe('printVerificationResults', () => {
    it('should print results for valid PDF', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const mockResult: PDFVerificationResult = {
        isValid: true,
        hasContent: true,
        pageCount: 1,
        contentLength: 500,
        issues: [],
        warnings: ['Minor warning'],
        textContent: 'Sample content'
      };

      printVerificationResults('test.pdf', mockResult);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should print results for invalid PDF', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const mockResult: PDFVerificationResult = {
        isValid: false,
        hasContent: false,
        pageCount: 0,
        contentLength: 0,
        issues: ['PDF file is empty', 'No content found'],
        warnings: [],
        textContent: ''
      };

      printVerificationResults('empty.pdf', mockResult);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle missing page count', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const mockResult: PDFVerificationResult = {
        isValid: true,
        hasContent: true,
        pageCount: undefined,
        contentLength: 500,
        issues: [],
        warnings: ['Could not determine page count'],
        textContent: 'Sample content'
      };

      printVerificationResults('test.pdf', mockResult);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
