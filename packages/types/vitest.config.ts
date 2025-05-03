import { defineConfig } from 'vitest/config';
import baseConfig from '@dzb-cv/config/vitest';

export default defineConfig({
  ...baseConfig,
  // Add any package-specific Vitest overrides here if necessary
  test: {
    // Example override:
    // ...
  },
});

