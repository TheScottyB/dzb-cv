# @dzb-cv/core

Core functionality for the DZB-CV system, including CV processing and ATS analysis.

## Features

- Document parsing and processing
- ATS compatibility analysis
- Profile management
- Storage services
- PDF generation
- Import/Export capabilities

## Usage

```typescript
import { CVService, ProfileService } from '@dzb-cv/core';

// Initialize services
const cvService = new CVService();
const profileService = new ProfileService();

// Process a CV
await cvService.process({
  // CV processing options
});

// Manage profiles
const profile = await profileService.load('profile-id');
```

## API Documentation

### CVService

Core service for CV processing and generation.

### ProfileService

Manages CV profiles and data storage.

### ATSService

Handles ATS compatibility analysis and optimization.

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Test
pnpm test
```

