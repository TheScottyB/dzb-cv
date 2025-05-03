import { defineConfig } from 'vitest/config';
import baseConfig from '@dzb-cv/config/vitest';

export default defineConfig({
  ...baseConfig,
  // Add any package-specific Vitest overrides here if necessary
  test: {
    // Example override:
    // coverage: {
    //   provider: 'v8', // Or 'istanbul'
    //   exclude: [
    //     // You can keep the base exclusions if baseConfig.test?.coverage?.exclude exists
    //     // ...(baseConfig.test?.coverage?.exclude ?? []),
    //     '**/specific-file-to-exclude.ts'
    //   ],
    // },
  },
});
