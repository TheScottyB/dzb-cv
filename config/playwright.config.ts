import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Playwright configuration for CV generation system
 * 
 * This config includes:
 * - Multiple browser configurations
 * - Mobile device emulation
 * - Integration with CI
 * - PDF testing capabilities
 */
export default defineConfig({
  // Test directory and file patterns
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  
  // Maximum time one test can run for
  timeout: 30 * 1000,
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Limit parallel tests on CI
  workers: process.env.CI ? 2 : undefined,
  
  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/test-results.json' }]
  ],
  
  // Shared settings for all projects
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    // Collect trace when retrying the failed test
    trace: process.env.CI ? 'on-first-retry' : 'on',
    
    // Record screenshots on failure
    screenshot: 'only-on-failure',
    
    // Record video on failure
    video: 'on-first-retry',
  },
  
  // Configure projects for different browsers and devices
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
    {
      name: 'PDF Testing',
      testMatch: '**/*.pdf.spec.ts',
      use: { 
        ...devices['Desktop Chrome'],
        // Additional PDF-specific configuration
        viewport: { width: 1280, height: 1600 },
        launchOptions: {
          args: ['--export-tagged-pdf']
        }
      },
    }
  ],
  
  // Local development server setup
  webServer: process.env.CI ? undefined : {
    command: 'pnpm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
  
  // Output directory for storing test artifacts
  outputDir: 'test-results/',
  
  // Global teardown to run after all tests
  globalTeardown: process.env.CI 
    ? undefined
    : path.join(__dirname, 'e2e/global-teardown.ts'),
});

