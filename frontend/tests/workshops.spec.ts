import { test, expect } from '@playwright/test';

test.describe('Workshop Management - MVP.4F Frontend', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to login page and authenticate
    await page.goto('/login');
  });

  test('should display workshop listing page for volunteers', async ({ page }) => {
    // Login as volunteer
    await page.fill('[data-testid="email-input"]', 'volunteer@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePass123!');
    await page.click('[data-testid="login-button"]');
    
    // Wait for redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Navigate to workshops
    await page.click('[data-testid="nav-workshops"]');
    await expect(page).toHaveURL('/workshops');
    
    // Check workshop listing components
    await expect(page.locator('[data-testid="workshop-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="workshop-filters"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-workshops"]')).toBeVisible();
    
    // Check filter options
    await expect(page.locator('[data-testid="filter-region"]')).toBeVisible();
    await expect(page.locator('[data-testid="filter-specialization"]')).toBeVisible();
    await expect(page.locator('[data-testid="filter-date"]')).toBeVisible();
  });

  test('should filter workshops by region', async ({ page }) => {
    // Login as volunteer
    await page.fill('[data-testid="email-input"]', 'volunteer@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePass123!');
    await page.click('[data-testid="login-button"]');
    
    await page.goto('/workshops');
    
    // Select Montreal filter
    await page.selectOption('[data-testid="filter-region"]', 'Montreal');
    
    // Wait for filtered results
    await page.waitForTimeout(500);
  });

  test('should search workshops by title', async ({ page }) => {
    // Login as volunteer
    await page.fill('[data-testid="email-input"]', 'volunteer@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePass123!');
    await page.click('[data-testid="login-button"]');
    
    await page.goto('/workshops');
    
    // Search for employment law
    await page.fill('[data-testid="search-workshops"]', 'Employment');
    await page.press('[data-testid="search-workshops"]', 'Enter');
    
    // Wait for search results
    await page.waitForTimeout(500);
  });
}); 