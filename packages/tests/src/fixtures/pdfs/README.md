# PDF Test Fixtures

This directory contains PDF files used for testing. Each PDF file should have a corresponding JSON file in the snapshots directory that contains its expected metadata and structure.

## Files

- sample.pdf: A basic CV in PDF format
- minimal.pdf: A minimal CV with basic information
- federal.pdf: A federal-style CV
- academic.pdf: An academic CV with publications

## Usage

Use these files with the PDF test utilities to validate PDF generation:

```typescript
import { loadPDFFixture, expectPDFToMatch } from '../pdf-test-helpers';

test('generates correct PDF', async () => {
  const expected = await loadPDFFixture('sample');
  const result = await generatePDF(sampleData);
  expectPDFToMatch(result, expected);
});
```

