# @dzb-cv/tests

Shared test utilities and integration tests for the DZB-CV system.

## Features

- Mock data generators
- Test helpers
- Integration test suites
- Common test utilities

## Usage

```typescript
import { createMockProfile, createMockJobPosting } from '@dzb-cv/tests';

describe('CV Generation', () => {
  it('generates a CV correctly', async () => {
    const mockProfile = createMockProfile();
    // Test implementation
  });
});
```

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Run tests
pnpm test
```

## Adding New Test Utilities

See main README for detailed instructions on adding new test utilities.

