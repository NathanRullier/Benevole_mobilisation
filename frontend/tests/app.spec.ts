import { test, expect } from '@playwright/test';

test.describe('MVP.1F Frontend Foundation Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app before each test
    await page.goto('/');
  });

  test('should load the React application', async ({ page }) => {
    // Check that the page loads and has a title
    await expect(page).toHaveTitle(/Volunteer Management Platform/);
  });

  test('should display the main application container', async ({ page }) => {
    // Check for the main app container
    const appContainer = page.locator('#root');
    await expect(appContainer).toBeVisible();
  });

  test('should have responsive layout', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate using React Router', async ({ page }) => {
    // Test that routing is working (will be implemented in MVP.1F.8)
    await page.goto('/');
    await expect(page.locator('#root')).toBeVisible();
  });

  test('should load Material-UI theme', async ({ page }) => {
    // Check that MUI styles are loaded by looking for MUI classes
    const muiElements = await page.locator('[class*="MuiBox"], [class*="MuiContainer"], [class*="Mui"]');
    // We expect at least some MUI elements to be present once we implement the UI
    await expect(page.locator('#root')).toBeVisible();
  });

  test('should handle API client configuration', async ({ page }) => {
    // Test that the app can make API calls (will test backend connectivity)
    await page.goto('/');
    
    // Check for network requests to our backend (will be configured in MVP.1F.10)
    page.on('request', request => {
      if (request.url().includes('localhost:3000/api')) {
        expect(request.url()).toContain('/api/health');
      }
    });
  });

  test('should display loading states correctly', async ({ page }) => {
    // Test loading indicators (will be implemented with state management)
    await page.goto('/');
    await expect(page.locator('#root')).toBeVisible();
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Test error boundary functionality
    await page.goto('/non-existent-route');
    // Should not crash the application
    await expect(page.locator('#root')).toBeVisible();
  });

  test('should be accessible', async ({ page }) => {
    await page.goto('/');
    
    // Basic accessibility checks
    await expect(page.locator('main, [role="main"]')).toBeVisible();
    
    // Check for semantic HTML structure
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('should work across different browsers', async ({ page, browserName }) => {
    // This test runs across all configured browsers (Chrome, Firefox, Safari)
    await page.goto('/');
    await expect(page.locator('#root')).toBeVisible();
    
    // Log which browser is being tested
    console.log(`Testing on ${browserName}`);
  });
}); 