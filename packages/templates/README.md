# @dzb-cv/templates

CV templates and formatting utilities for the DZB-CV system.

## Templates

- Basic: Clean, professional layout
- Minimal: Modern, minimalist design
- Federal: US government format
- Academic: Comprehensive academic format

## Usage

```typescript
import { Template } from '@dzb-cv/templates';

// Load a template
const template = await Template.load('federal');

// Generate CV using template
const cv = await template.generate({
  // CV data
});
```

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Test
pnpm test
```

## Adding New Templates

See main README for detailed instructions on creating new templates.

