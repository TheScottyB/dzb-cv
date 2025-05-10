import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'fs';
import { dirname } from 'path';

test.describe('CV Generation Flow', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page title is correct
    await expect(page).toHaveTitle(/DZB CV/);
    
    // Verify key UI elements are present
    await expect(page.getByRole('heading', { name: /Create your CV/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Get Started/i })).toBeVisible();
  });

  test('should allow template selection', async ({ page }) => {
    await page.goto('/templates');
    
    // Verify templates are displayed
    const templateCards = page.locator('.template-card');
    await expect(templateCards).toHaveCount.atLeast(1);
    
    // Select the first template
    await templateCards.first().click();
    
    // Verify we've moved to the editor page
    await expect(page).toHaveURL(/editor/);
    await expect(page.getByText(/Personal Information/i)).toBeVisible();
  });

  test('should fill in CV information', async ({ page }) => {
    await page.goto('/editor');
    
    // Fill in basic information
    await page.getByLabel('Full Name').fill('John Doe');
    await page.getByLabel('Email').fill('john.doe@example.com');
    await page.getByLabel('Phone').fill('(555) 123-4567');
    
    // Add a skill
    await page.getByRole('button', { name: /Add Skill/i }).click();
    await page.getByPlaceholder('e.g., JavaScript').fill('TypeScript');
    await page.getByLabel('Skill Level').selectOption('Expert');
    
    // Verify data was saved
    await page.getByRole('button', { name: /Save/i }).click();
    await expect(page.getByText('Information saved')).toBeVisible();
  });

  test('should generate a PDF', async ({ page }) => {
    test.slow(); // PDF generation might take some time
    
    await page.goto('/preview');
    
    // Trigger PDF generation
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /Download PDF/i }).click();
    
    // Wait for download to start
    const download = await downloadPromise;
    
    // Verify the file name contains "CV" or "Resume"
    expect(download.suggestedFilename()).toMatch(/CV|Resume/i);
    
    // Wait for download to complete
    const path = await download.path();
    expect(path).toBeTruthy();
    
    // Optional: Basic check that the file exists and isn't empty
    expect(existsSync(path)).toBeTruthy();
    const fileContent = readFileSync(path);
    expect(fileContent.length).toBeGreaterThan(1000); // PDF should be reasonably sized
  });
  
  test('should pass basic accessibility checks', async ({ page }) => {
    await page.goto('/');
    
    // Check for basic accessibility issues
    // Note: For a real implementation, consider using axe-playwright or similar
    
    // Check for alt text on images
    const images = await page.locator('img').all();
    for (const image of images) {
      const alt = await image.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
    
    // Check heading hierarchy (should have h1 before any h2)
    const hasH1 = await page.locator('h1').count() > 0;
    expect(hasH1).toBeTruthy();
    
    // Check for sufficient color contrast (needs manual verification)
    // This is a basic check - real tests would use axe or similar
    await expect(page.locator('body')).toHaveCSS('color', /^rgb\((\d+, ){2}\d+\)$/);
  });
});

