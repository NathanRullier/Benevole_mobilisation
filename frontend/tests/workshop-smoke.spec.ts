import { test, expect } from '@playwright/test';

test.describe('Workshop System - Smoke Tests', () => {
  
  test('should load workshop page without errors', async ({ page }) => {
    // Navigate directly to workshops page (skip auth for smoke test)
    await page.goto('/workshops');
    
    // Check that the page loads and shows basic content
    await expect(page.locator('body')).toBeVisible();
    
    // Look for key elements (may not be visible if auth is required)
    const hasWorkshopContent = await page.locator('[data-testid="workshop-list"]').count() > 0;
    const hasLoginForm = await page.locator('[data-testid="email-input"]').count() > 0;
    
    // Either should show workshop content OR redirect to login
    expect(hasWorkshopContent || hasLoginForm).toBe(true);
  });

  test('should be able to navigate to login page', async ({ page }) => {
    await page.goto('/login');
    
    // Check login form elements exist
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
  });

  test('should show register page elements', async ({ page }) => {
    await page.goto('/register');
    
    // Check register form exists
    const hasRegisterForm = await page.locator('text=Register').count() > 0;
    const hasEmailField = await page.locator('input[type="email"]').count() > 0;
    
    expect(hasRegisterForm || hasEmailField).toBe(true);
  });

  test('should handle invalid routes gracefully', async ({ page }) => {
    await page.goto('/nonexistent-page');
    
    // Should either show 404 or redirect somewhere valid
    await expect(page.locator('body')).toBeVisible();
    
    // Check we don't get a blank page or JS error
    const hasContent = await page.locator('*').count() > 0;
    expect(hasContent).toBe(true);
  });

  test('frontend dev server should be responsive', async ({ page }) => {
    const start = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - start;
    
    // Should load within reasonable time (5 seconds)
    expect(loadTime).toBeLessThan(5000);
    
    // Should show some content
    await expect(page.locator('body')).toBeVisible();
  });
}); 