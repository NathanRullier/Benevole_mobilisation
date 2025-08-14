import { test, expect } from '@playwright/test';

test.describe('Workshop Management - MVP.4F Frontend', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
  });

  test.describe('Workshop Listing - Volunteer View', () => {
    test.beforeEach(async ({ page }) => {
      // Login as volunteer
      await page.fill('[data-testid="email-input"]', 'volunteer@example.com');
      await page.fill('[data-testid="password-input"]', 'SecurePass123!');
      await page.click('[data-testid="login-button"]');
      
      // Navigate to workshops
      await page.goto('/workshops');
    });

    test('should display workshop listing page for volunteers', async ({ page }) => {
      // Check page title and basic components
      await expect(page.locator('text=Available Workshops')).toBeVisible();
      await expect(page.locator('[data-testid="workshop-list"]')).toBeVisible();
      await expect(page.locator('[data-testid="workshop-filters"]')).toBeVisible();
      
      // Check filter options are available
      await expect(page.locator('[data-testid="search-workshops"]')).toBeVisible();
      await expect(page.locator('[data-testid="filter-region"]')).toBeVisible();
      await expect(page.locator('[data-testid="filter-specialization"]')).toBeVisible();
      await expect(page.locator('[data-testid="filter-date"]')).toBeVisible();
      
      // Volunteer should NOT see create workshop button
      await expect(page.locator('text=Create Workshop')).not.toBeVisible();
    });

    test('should filter workshops by region', async ({ page }) => {
      // Select Montreal filter
      await page.selectOption('[data-testid="filter-region"]', 'Montreal');
      
      // Check that filter chip appears
      await expect(page.locator('text=Region: Montreal')).toBeVisible();
      
      // Should be able to clear filter
      await page.click('[data-testid="clear-filters"]');
      await expect(page.locator('text=Region: Montreal')).not.toBeVisible();
    });

    test('should search workshops by title', async ({ page }) => {
      // Search for workshops
      await page.fill('[data-testid="search-workshops"]', 'Employment');
      
      // Check that search chip appears
      await expect(page.locator('text=Search: Employment')).toBeVisible();
      
      // Clear search
      await page.fill('[data-testid="search-workshops"]', '');
      await expect(page.locator('text=Search: Employment')).not.toBeVisible();
    });

    test('should switch between view modes', async ({ page }) => {
      // Test view mode switches
      await page.click('[title="List View"]');
      await page.click('[title="Grid View"]');
      await page.click('[title="Calendar View"]');
      
      // Should show calendar when in calendar mode
      await expect(page.locator('[data-testid="workshop-calendar"]')).toBeVisible();
    });

    test('should display workshop details in modal', async ({ page }) => {
      // Wait for workshops to load
      await page.waitForTimeout(1000);
      
      // Look for any workshop card and click it
      const workshopCard = page.locator('[data-testid^="workshop-card"]').first();
      if (await workshopCard.count() > 0) {
        await workshopCard.click();
        
        // Check modal opens
        await expect(page.locator('[data-testid="workshop-detail-modal"]')).toBeVisible();
        
        // Should show apply button for volunteers
        await expect(page.locator('text=Apply')).toBeVisible();
        
        // Close modal
        await page.click('[data-testid="close-modal"]');
      }
    });
  });

  test.describe('Workshop Management - Coordinator View', () => {
    test.beforeEach(async ({ page }) => {
      // Login as coordinator
      await page.fill('[data-testid="email-input"]', 'coordinator@example.com');
      await page.fill('[data-testid="password-input"]', 'SecurePass123!');
      await page.click('[data-testid="login-button"]');
      
      // Navigate to workshops
      await page.goto('/workshops');
    });

    test('should display workshop management interface for coordinators', async ({ page }) => {
      // Check page title
      await expect(page.locator('text=Workshop Management')).toBeVisible();
      
      // Coordinator should see create workshop button
      await expect(page.locator('text=Create Workshop')).toBeVisible();
      
      // Should see status filter (coordinator only)
      await expect(page.locator('[data-testid="filter-status"]')).toBeVisible();
      
      // Should see floating action button
      await expect(page.locator('[aria-label="add workshop"]')).toBeVisible();
    });

    test('should open workshop creation modal', async ({ page }) => {
      // Click create workshop button
      await page.click('text=Create Workshop');
      
      // Check modal opens
      await expect(page.locator('[data-testid="workshop-create-modal"]')).toBeVisible();
      await expect(page.locator('text=Create New Workshop')).toBeVisible();
      
      // Check required fields are present
      await expect(page.locator('[data-testid="workshop-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="workshop-description"]')).toBeVisible();
      await expect(page.locator('[data-testid="workshop-date"]')).toBeVisible();
      await expect(page.locator('[data-testid="workshop-start-time"]')).toBeVisible();
      await expect(page.locator('[data-testid="workshop-end-time"]')).toBeVisible();
      
      // Close modal
      await page.click('text=Cancel');
      await expect(page.locator('[data-testid="workshop-create-modal"]')).not.toBeVisible();
    });

    test('should validate workshop creation form', async ({ page }) => {
      // Open creation modal
      await page.click('text=Create Workshop');
      
      // Try to submit without required fields
      await page.click('[data-testid="workshop-create-submit"]');
      
      // Should show validation error
      await expect(page.locator('text=Title is required')).toBeVisible();
    });

    test('should create a new workshop', async ({ page }) => {
      // Open creation modal
      await page.click('text=Create Workshop');
      
      // Fill required fields
      await page.fill('[data-testid="workshop-title"]', 'Test Workshop');
      await page.fill('[data-testid="workshop-description"]', 'Test workshop description');
      
      // Set future date
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const dateString = futureDate.toISOString().split('T')[0];
      await page.fill('[data-testid="workshop-date"]', dateString);
      
      // Fill location
      await page.fill('[data-testid="workshop-location-city"]', 'Montreal');
      await page.selectOption('[data-testid="workshop-location-region"]', 'Montreal');
      
      // Fill contact
      await page.fill('[data-testid="workshop-contact-name"]', 'Test Contact');
      await page.fill('[data-testid="workshop-contact-email"]', 'test@example.com');
      
      // Select audience and type
      await page.selectOption('[data-testid="workshop-target-audience"]', 'General Public');
      await page.selectOption('[data-testid="workshop-type"]', 'Educational Presentation');
      
      // Submit form
      await page.click('[data-testid="workshop-create-submit"]');
      
      // Should close modal and refresh list
      await expect(page.locator('[data-testid="workshop-create-modal"]')).not.toBeVisible();
    });

    test('should show coordinator actions on workshop cards', async ({ page }) => {
      // Wait for workshops to load
      await page.waitForTimeout(1000);
      
      // Look for any workshop card
      const workshopCard = page.locator('[data-testid^="workshop-card"]').first();
      if (await workshopCard.count() > 0) {
        await workshopCard.click();
        
        // Should show coordinator actions in modal
        await expect(page.locator('text=Edit')).toBeVisible();
        await expect(page.locator('text=Delete')).toBeVisible();
        
        // Should NOT show apply button for coordinators
        await expect(page.locator('text=Apply')).not.toBeVisible();
      }
    });
  });

  test.describe('Workshop Calendar View', () => {
    test.beforeEach(async ({ page }) => {
      // Login as volunteer
      await page.fill('[data-testid="email-input"]', 'volunteer@example.com');
      await page.fill('[data-testid="password-input"]', 'SecurePass123!');
      await page.click('[data-testid="login-button"]');
      
      await page.goto('/workshops');
    });

    test('should display workshop calendar', async ({ page }) => {
      // Switch to calendar view
      await page.click('[title="Calendar View"]');
      
      // Check calendar is visible
      await expect(page.locator('[data-testid="workshop-calendar"]')).toBeVisible();
      
      // Check navigation controls
      await expect(page.locator('[data-testid="calendar-today"]')).toBeVisible();
      await expect(page.locator('[data-testid="calendar-prev-month"]')).toBeVisible();
      await expect(page.locator('[data-testid="calendar-next-month"]')).toBeVisible();
    });

    test('should navigate calendar months', async ({ page }) => {
      // Switch to calendar view
      await page.click('[title="Calendar View"]');
      
      // Click next month
      await page.click('[data-testid="calendar-next-month"]');
      
      // Click previous month
      await page.click('[data-testid="calendar-prev-month"]');
      
      // Click today
      await page.click('[data-testid="calendar-today"]');
    });

    test('should show workshops on calendar days', async ({ page }) => {
      // Switch to calendar view
      await page.click('[title="Calendar View"]');
      
      // Look for workshop chips on calendar days
      const workshopChips = page.locator('[data-testid^="workshop-"]');
      
      // If workshops exist, they should be clickable
      if (await workshopChips.count() > 0) {
        await workshopChips.first().click();
        await expect(page.locator('[data-testid="workshop-detail-modal"]')).toBeVisible();
      }
    });
  });

  test.describe('Workshop Location and Mapping', () => {
    test.beforeEach(async ({ page }) => {
      // Login as volunteer
      await page.fill('[data-testid="email-input"]', 'volunteer@example.com');
      await page.fill('[data-testid="password-input"]', 'SecurePass123!');
      await page.click('[data-testid="login-button"]');
      
      await page.goto('/workshops');
    });

    test('should display workshop location information', async ({ page }) => {
      // Wait for workshops to load
      await page.waitForTimeout(1000);
      
      // Open first workshop detail
      const workshopCard = page.locator('[data-testid^="workshop-card"]').first();
      if (await workshopCard.count() > 0) {
        await workshopCard.click();
        
        // Should show location map component
        await expect(page.locator('[data-testid="workshop-location-map"]')).toBeVisible();
        
        // Should show map and directions buttons
        await expect(page.locator('[data-testid="open-map"]')).toBeVisible();
        await expect(page.locator('[data-testid="get-directions"]')).toBeVisible();
        await expect(page.locator('[data-testid="copy-address"]')).toBeVisible();
      }
    });

    test('should handle location actions', async ({ page }) => {
      // Wait for workshops to load
      await page.waitForTimeout(1000);
      
      // Open first workshop detail
      const workshopCard = page.locator('[data-testid^="workshop-card"]').first();
      if (await workshopCard.count() > 0) {
        await workshopCard.click();
        
        // Test copy address functionality
        await page.click('[data-testid="copy-address"]');
        
        // Test contact actions if available
        const emailButton = page.locator('[data-testid="email-contact"]');
        if (await emailButton.count() > 0) {
          await expect(emailButton).toBeVisible();
        }
        
        const phoneButton = page.locator('[data-testid="phone-contact"]');
        if (await phoneButton.count() > 0) {
          await expect(phoneButton).toBeVisible();
        }
      }
    });
  });

  test.describe('Workshop Filtering and Search', () => {
    test.beforeEach(async ({ page }) => {
      // Login as volunteer
      await page.fill('[data-testid="email-input"]', 'volunteer@example.com');
      await page.fill('[data-testid="password-input"]', 'SecurePass123!');
      await page.click('[data-testid="login-button"]');
      
      await page.goto('/workshops');
    });

    test('should handle multiple filters simultaneously', async ({ page }) => {
      // Apply region filter
      await page.selectOption('[data-testid="filter-region"]', 'Montreal');
      
      // Apply specialization filter
      await page.selectOption('[data-testid="filter-specialization"]', 'Employment Law');
      
      // Apply date filter
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const dateString = futureDate.toISOString().split('T')[0];
      await page.fill('[data-testid="filter-date"]', dateString);
      
      // Add search term
      await page.fill('[data-testid="search-workshops"]', 'Legal');
      
      // Check that multiple filter chips appear
      await expect(page.locator('text=Region: Montreal')).toBeVisible();
      await expect(page.locator('text=Specialization: Employment Law')).toBeVisible();
      await expect(page.locator('text=Search: Legal')).toBeVisible();
      
      // Clear all filters
      await page.click('text=Clear');
      
      // All chips should disappear
      await expect(page.locator('text=Region: Montreal')).not.toBeVisible();
      await expect(page.locator('text=Specialization: Employment Law')).not.toBeVisible();
      await expect(page.locator('text=Search: Legal')).not.toBeVisible();
    });

    test('should show filter results count', async ({ page }) => {
      // Should show total workshops count
      await expect(page.locator('text=workshops found')).toBeVisible();
      
      // Apply a filter
      await page.selectOption('[data-testid="filter-region"]', 'Montreal');
      
      // Count should update (may be same if all workshops are in Montreal)
      await page.waitForTimeout(500);
      await expect(page.locator('text=workshops found')).toBeVisible();
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test.beforeEach(async ({ page }) => {
      // Login as volunteer
      await page.fill('[data-testid="email-input"]', 'volunteer@example.com');
      await page.fill('[data-testid="password-input"]', 'SecurePass123!');
      await page.click('[data-testid="login-button"]');
      
      await page.goto('/workshops');
    });

    test('should handle no workshops found gracefully', async ({ page }) => {
      // Apply filters that should return no results
      await page.selectOption('[data-testid="filter-region"]', 'Montreal');
      await page.fill('[data-testid="search-workshops"]', 'NonexistentWorkshop12345');
      
      // Should show no workshops message
      await expect(page.locator('text=No workshops found')).toBeVisible();
      await expect(page.locator('text=Try adjusting your filters')).toBeVisible();
    });

    test('should handle loading states', async ({ page }) => {
      // Refresh page to trigger loading
      await page.reload();
      
      // Should show loading or content eventually
      await expect(page.locator('[data-testid="workshop-list"]')).toBeVisible({ timeout: 10000 });
    });
  });
}); 