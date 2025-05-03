# Testing Strategy for @dzb-cv/core

## Overview
This package uses Vitest as the testing framework and aims to maintain 100% code coverage through a combination of unit tests and integration tests.

## Test Structure
Tests are organized in two main categories:

1. Unit Tests (`src/services/__tests__/`)
   - Located adjacent to the service implementations
   - Focus on individual service methods and behaviors
   - Use mocked dependencies for isolation

2. Integration Tests (`src/__tests__/`)
   - Test the public API through the package exports
   - Verify proper module composition
   - Ensure barrel file exports work correctly

## Testing Conventions

### File Organization
- Test files should be placed in `__tests__` directories
- Test files should be named `*.test.ts`
- Mock files should be placed in `__mocks__` directories when needed

### Mocking Strategy
We use Vitest's mocking capabilities for dependencies:

```typescript
const mockStorage = {
  save: vi.fn(),
  load: vi.fn(),
  delete: vi.fn()
};

const mockPdfGenerator = {
  generate: vi.fn()
};
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

## Best Practices

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

