# Testing Strategy for DZB-CV

## Overview
This project uses a comprehensive testing strategy combining traditional unit/integration tests with advanced AI quality assurance. The testing framework includes Vitest for standard testing and specialized AI evaluation tools for content quality validation.

## Test Structure
Tests are organized in multiple categories:

### Traditional Testing
1. **Unit Tests** (`src/services/__tests__/`)
   - Located adjacent to the service implementations
   - Focus on individual service methods and behaviors
   - Use mocked dependencies for isolation

2. **Integration Tests** (`src/__tests__/`)
   - Test the public API through the package exports
   - Verify proper module composition
   - Ensure barrel file exports work correctly

### AI Quality Assurance (v2.0)
3. **CV Quality Evaluation** (`scripts/evaluate-cv-quality.js`)
   - Comprehensive metrics assessment (relevance, density, readability, compliance)
   - Orphaned header detection and validation
   - Performance scoring with configurable thresholds
   - Export capabilities for CI/CD integration

4. **AI Distillation Testing** (`scripts/test-ai-distillation.js`)
   - End-to-end AI pipeline validation
   - Before/after quality comparison
   - Automated improvement analysis
   - Performance benchmarking

5. **A/B Testing Framework** (`scripts/simple-ab-test.js`)
   - Multi-configuration performance comparison
   - Scientific analysis of AI model improvements
   - Statistical significance testing
   - Automated recommendations

## Testing Conventions

### File Organization
- Test files should be placed in `__tests__` directories
- Test files should be named `*.test.ts`
- Mock files should be placed in `__mocks__` directories when needed

### Mocking Strategy

- Use Vitest's ESM-compatible mocking for all external modules:
  - Use `vi.mock('module', async (importActual) => { ... })` to ensure all named and default exports are available and only override what you need.
  - Always hoist mocks to the top of the test file, before imports that use the mocked module.

#### Example

```typescript
vi.mock('@dzb-cv/pdf', async (importActual) => {
  const actual = await importActual<typeof import('@dzb-cv/pdf')>();
  return {
    ...actual,
    createPDFGenerator: vi.fn().mockImplementation(() => ({ generate: vi.fn() })),
  };
});
```

### Shared Test Utilities

- Each package should have a `test-utils.ts` for shared sample data, factories, and helpers.
- All test files should import from `test-utils.ts` to avoid duplication and keep tests DRY.

#### Example

```typescript
// test-utils.ts
export const sampleCV = { ... };

// In your test file
import { sampleCV } from '../test-utils';
```

### Test Coverage Requirements
- 100% line coverage is required
- All branches must be tested
- All exported functions must have tests
- Barrel files must be tested through integration tests

## Running Tests

### Basic Test Run
```bash
pnpm test
```

### With Coverage Report
```bash
pnpm test --coverage
```

### Watch Mode (During Development)
```bash
pnpm test --watch
```

### AI Quality Assurance Testing

#### CV Quality Evaluation
```bash
# Evaluate a CV with comprehensive metrics
node scripts/evaluate-cv-quality.js path/to/cv.md --keywords "healthcare,EKG,technician" --export results.json

# Basic quality check
node scripts/evaluate-cv-quality.js cv-versions/dawn-ekg-technician-cv.md

# With custom parameters
node scripts/evaluate-cv-quality.js path/to/cv.md --max-lines 45 --max-chars 3500 --keywords "keyword1,keyword2"
```

#### AI Distillation Pipeline Testing
```bash
# Test complete AI distillation pipeline
node scripts/test-ai-distillation.js cv-versions/dawn-ekg-technician-cv.md

# Test with custom CV
node scripts/test-ai-distillation.js path/to/your-cv.md
```

#### A/B Testing Framework
```bash
# Run A/B tests comparing different AI configurations
node scripts/simple-ab-test.js cv-versions/dawn-ekg-technician-cv.md --keywords "healthcare,EKG" --export ab-results.json

# Custom A/B testing
node scripts/simple-ab-test.js path/to/cv.md --keywords "keyword1,keyword2" --export results.json
```

## Writing Tests

### Unit Test Example
```typescript
import { describe, it, expect, vi } from 'vitest';
import { CVService } from '../cv-service';

describe('CVService', () => {
  it('should create a CV', async () => {
    const mockStorage = {
      save: vi.fn().mockResolvedValue(undefined)
    };
    const service = new CVService(mockStorage);
    const cvData = {
      // ... test data
    };
    
    await service.createCV(cvData);
    expect(mockStorage.save).toHaveBeenCalledWith(
      expect.any(String),
      cvData
    );
  });
});
```

### Integration Test Example
```typescript
import { describe, it, expect } from 'vitest';
import { CVService } from '../index';

describe('Package exports', () => {
  it('should properly export CVService', () => {
    expect(CVService).toBeDefined();
    const service = new CVService();
    expect(service).toBeInstanceOf(CVService);
  });
});
```

## AI Quality Assurance Framework

### Quality Metrics Explained

The AI quality assurance system evaluates CVs across 5 key dimensions:

#### 1. Relevance Score (0-100)
- **What it measures**: Keyword alignment and section completeness
- **Good score**: 70+ indicates strong relevance to target keywords
- **Factors**: Target keyword matches, complete sections with content
- **Example**: Healthcare CV with "EKG", "patient care" keywords = higher relevance

#### 2. Information Density (0-100+)
- **What it measures**: Meaningful content per character
- **Good score**: 60-100 indicates efficient use of space
- **Factors**: Bullet points, structured content, minimal fluff
- **Note**: Scores >100 indicate very dense, well-structured content

#### 3. Readability Score (0-100)
- **What it measures**: Sentence structure and formatting quality
- **Good score**: 70+ indicates professional readability
- **Factors**: Sentence length (8-20 words ideal), bullet point usage
- **Example**: Well-structured bullet points = higher readability

#### 4. Length Compliance (0-100)
- **What it measures**: Adherence to single-page constraints
- **Good score**: 80+ indicates good fit for single-page format
- **Factors**: Total lines (<50), total characters (<4000)
- **Target**: 100 = perfect single-page compliance

#### 5. Orphaned Headers (count)
- **What it measures**: Headers without meaningful content
- **Good score**: 0 (zero orphaned headers)
- **Critical**: Any orphaned header makes CV unprofessional
- **Example**: "## SKILLS" with no skills listed = orphaned header

### Quality Thresholds

```typescript
// Quality gates for CI/CD
const QUALITY_THRESHOLDS = {
  overallScore: 70,        // Overall quality must be "Good" or better
  relevanceScore: 60,      // Adequate keyword relevance
  informationDensity: 50,  // Minimum content density
  readabilityScore: 60,    // Professional readability
  lengthCompliance: 80,    // Good single-page fit
  orphanedHeaders: 0       // Zero tolerance for orphaned headers
};
```

### Testing Workflow

#### 1. Development Testing
```bash
# Quick quality check during development
node scripts/evaluate-cv-quality.js path/to/cv.md

# Full pipeline test with metrics
node scripts/test-ai-distillation.js path/to/cv.md
```

#### 2. Pre-commit Testing
```bash
# Comprehensive quality validation
node scripts/evaluate-cv-quality.js cv-versions/dawn-ekg-technician-cv.md --export quality-check.json

# A/B test to ensure no regressions
node scripts/simple-ab-test.js cv-versions/dawn-ekg-technician-cv.md --export ab-test.json
```

#### 3. CI/CD Integration
```yaml
# Example GitHub Actions workflow
name: AI Quality Assurance
on: [push, pull_request]

jobs:
  ai-quality-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      # Install dependencies
      - run: pnpm install
      
      # Run AI quality checks
      - name: CV Quality Evaluation
        run: |
          node scripts/evaluate-cv-quality.js cv-versions/dawn-ekg-technician-cv.md \
            --export quality-results.json
          
          # Check if quality meets threshold
          if [ $(jq '.passed' quality-results.json) = "false" ]; then
            echo "Quality check failed"
            exit 1
          fi
      
      # Run AI distillation test
      - name: AI Distillation Test
        run: node scripts/test-ai-distillation.js cv-versions/dawn-ekg-technician-cv.md
      
      # Upload test results
      - uses: actions/upload-artifact@v3
        with:
          name: ai-quality-results
          path: |
            quality-results.json
            ai-distillation-test-results.json
```

### Interpreting Results

#### Quality Evaluation Output
```bash
📊 CV Quality Evaluation Results
================================

📈 Relevance Score:      91/100  # Excellent keyword alignment
📝 Information Density:  129/100 # Very dense, well-structured
📖 Readability Score:    35/100  # Poor - needs improvement
📏 Length Compliance:    44/100  # Poor - too long for single page
🚫 Orphaned Headers:     3       # Critical - makes CV unprofessional

⭐ Overall Score:        26/100  # Poor - requires major revisions

❌ Poor - CV requires major revisions
```

#### Improvement Recommendations
Based on the results above:
1. **Fix orphaned headers** (Priority 1): Remove headers without content
2. **Improve readability**: Add bullet points, shorter sentences
3. **Reduce length**: Condense content to meet single-page constraints
4. **Maintain relevance**: Keep high keyword relevance score

#### A/B Testing Results
```bash
🧪 A/B TEST RESULTS
============================================================

🏆 Best Configuration:
   Name: GPT-4o Precise
   Model: gpt-4o
   Temperature: 0.1
   Score: 75/100        # Excellent quality
   Orphaned Headers: 0  # Perfect - no orphaned headers
   Type: Simulated

💡 Recommendations:
   • Upgrade to GPT-4o model for 36.7 point improvement
   • Optimal temperature setting: 0.1 (Score: 75)
   • 3/4 configurations eliminated orphaned headers
```

## Best Practices

- Use the shared test-utils and ESM mocking pattern for all new and refactored tests.
- Always reset mocks between tests with `vi.clearAllMocks()`.
- Prefer meaningful assertions and test both happy and error paths.

1. **Isolation**: Each test should be independent and not rely on the state of other tests

2. **Meaningful Assertions**: Test the behavior, not the implementation
   ```typescript
   // Good
   expect(result).toEqual(expectedOutput);
   
   // Avoid
   expect(mockFn).toHaveBeenCalled();  // unless testing interactions
   ```

3. **Error Cases**: Always include tests for error conditions
   ```typescript
   it('should handle missing CV gracefully', async () => {
     const service = new CVService();
     await expect(service.getCV('non-existent'))
       .rejects.toThrow('CV not found');
   });
   ```

4. **Type Testing**: Leverage TypeScript to ensure type safety in tests
   ```typescript
   import type { CVData } from '@dzb-cv/types';
   
   const validCVData: CVData = {
     // ... properly typed test data
   };
   ```

## Continuous Integration

The test suite runs in CI for:
- Pull requests
- Merges to main branch
- Release builds

Coverage reports are generated and tracked to maintain quality.

## Troubleshooting

Common issues and solutions:

1. **Mock Reset**: Reset mocks between tests
   ```typescript
   beforeEach(() => {
     vi.clearAllMocks();
   });
   ```

2. **Async Tests**: Always await async operations
   ```typescript
   it('should handle async operations', async () => {
     await expect(asyncOperation()).resolves.toBeDefined();
   });
   ```

## Contributing

When adding new features:
1. Write tests first (TDD approach recommended)
2. Maintain 100% coverage
3. Include both happy and error paths
4. Add integration tests for new exports
5. Run full test suite before submitting PR

## Support

For questions about testing, please:
1. Check existing test files for examples
2. Review Vitest documentation
3. Open an issue for discussion of testing strategy

