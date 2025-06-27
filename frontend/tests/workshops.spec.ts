import { test, expect } from '@playwright/test';

test.describe('Workshop Management - MVP.4F Frontend', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to login page and authenticate
    await page.goto('/login');
  });

  test.describe('MVP.4F.1 - Workshop Display Components', () => {
    
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

    test('should display individual workshop cards with key information', async ({ page }) => {
      // Login as volunteer
      await page.fill('[data-testid="email-input"]', 'volunteer@example.com');
      await page.fill('[data-testid="password-input"]', 'SecurePass123!');
      await page.click('[data-testid="login-button"]');
      
      await page.goto('/workshops');
      
      // Wait for workshops to load
      await page.waitForSelector('[data-testid="workshop-card"]');
      
      const firstWorkshop = page.locator('[data-testid="workshop-card"]').first();
      
      // Check workshop card elements
      await expect(firstWorkshop.locator('[data-testid="workshop-title"]')).toBeVisible();
      await expect(firstWorkshop.locator('[data-testid="workshop-date"]')).toBeVisible();
      await expect(firstWorkshop.locator('[data-testid="workshop-time"]')).toBeVisible();
      await expect(firstWorkshop.locator('[data-testid="workshop-location"]')).toBeVisible();
      await expect(firstWorkshop.locator('[data-testid="workshop-specializations"]')).toBeVisible();
      await expect(firstWorkshop.locator('[data-testid="workshop-status"]')).toBeVisible();
      await expect(firstWorkshop.locator('[data-testid="apply-button"]')).toBeVisible();
    });

    test('should open workshop detail modal when clicking on workshop', async ({ page }) => {
      // Login as volunteer
      await page.fill('[data-testid="email-input"]', 'volunteer@example.com');
      await page.fill('[data-testid="password-input"]', 'SecurePass123!');
      await page.click('[data-testid="login-button"]');
      
      await page.goto('/workshops');
      
      // Click on first workshop
      await page.click('[data-testid="workshop-card"]');
      
      // Check modal appears
      await expect(page.locator('[data-testid="workshop-detail-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="modal-workshop-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="modal-workshop-description"]')).toBeVisible();
      await expect(page.locator('[data-testid="modal-workshop-details"]')).toBeVisible();
      await expect(page.locator('[data-testid="modal-contact-info"]')).toBeVisible();
      await expect(page.locator('[data-testid="modal-apply-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="modal-close-button"]')).toBeVisible();
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
      
      // Check that filtered workshops are displayed
      const workshops = page.locator('[data-testid="workshop-card"]');
      const count = await workshops.count();
      
      if (count > 0) {
        // Check first workshop contains Montreal
        const location = await workshops.first().locator('[data-testid="workshop-location"]').textContent();
        expect(location).toContain('Montreal');
      }
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
      
      // Check search results
      const workshops = page.locator('[data-testid="workshop-card"]');
      const count = await workshops.count();
      
      if (count > 0) {
        const title = await workshops.first().locator('[data-testid="workshop-title"]').textContent();
        expect(title?.toLowerCase()).toContain('employment');
      }
    });

    test('should display workshop calendar view', async ({ page }) => {
      // Login as volunteer
      await page.fill('[data-testid="email-input"]', 'volunteer@example.com');
      await page.fill('[data-testid="password-input"]', 'SecurePass123!');
      await page.click('[data-testid="login-button"]');
      
      await page.goto('/workshops');
      
      // Switch to calendar view
      await page.click('[data-testid="view-calendar"]');
      
      // Check calendar components
      await expect(page.locator('[data-testid="workshop-calendar"]')).toBeVisible();
      await expect(page.locator('[data-testid="calendar-navigation"]')).toBeVisible();
      await expect(page.locator('[data-testid="calendar-month-view"]')).toBeVisible();
    });
  });

  test.describe('MVP.4F.2 - Coordinator Workshop Management', () => {
    
    test('should display workshop creation form for coordinators', async ({ page }) => {
      // Login as coordinator
      await page.fill('[data-testid="email-input"]', 'coordinator@educaloi.qc.ca');
      await page.fill('[data-testid="password-input"]', 'SecurePass123!');
      await page.click('[data-testid="login-button"]');
      
      await page.goto('/coordinator/workshops');
      
      // Click create workshop button
      await page.click('[data-testid="create-workshop-button"]');
      
      // Check form elements
      await expect(page.locator('[data-testid="workshop-form"]')).toBeVisible();
      await expect(page.locator('[data-testid="form-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="form-description"]')).toBeVisible();
      await expect(page.locator('[data-testid="form-date"]')).toBeVisible();
      await expect(page.locator('[data-testid="form-start-time"]')).toBeVisible();
      await expect(page.locator('[data-testid="form-end-time"]')).toBeVisible();
      await expect(page.locator('[data-testid="form-location-name"]')).toBeVisible();
      await expect(page.locator('[data-testid="form-location-address"]')).toBeVisible();
      await expect(page.locator('[data-testid="form-max-volunteers"]')).toBeVisible();
      await expect(page.locator('[data-testid="form-specializations"]')).toBeVisible();
      await expect(page.locator('[data-testid="save-draft-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="publish-button"]')).toBeVisible();
    });

    test('should create workshop as draft', async ({ page }) => {
      // Login as coordinator
      await page.fill('[data-testid="email-input"]', 'coordinator@educaloi.qc.ca');
      await page.fill('[data-testid="password-input"]', 'SecurePass123!');
      await page.click('[data-testid="login-button"]');
      
      await page.goto('/coordinator/workshops');
      await page.click('[data-testid="create-workshop-button"]');
      
      // Fill form
      await page.fill('[data-testid="form-title"]', 'Test Employment Law Workshop');
      await page.fill('[data-testid="form-description"]', 'A comprehensive workshop on employment law basics');
      await page.fill('[data-testid="form-date"]', '2024-06-15');
      await page.fill('[data-testid="form-start-time"]', '09:00');
      await page.fill('[data-testid="form-end-time"]', '12:00');
      await page.fill('[data-testid="form-location-name"]', 'Montreal High School');
      await page.fill('[data-testid="form-location-address"]', '123 Main St, Montreal, QC');
      await page.fill('[data-testid="form-max-volunteers"]', '2');
      
      // Select specializations
      await page.click('[data-testid="form-specializations"]');
      await page.click('[data-testid="specialization-employment-law"]');
      
      // Save as draft
      await page.click('[data-testid="save-draft-button"]');
      
      // Check success message
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="success-message"]')).toContainText('Workshop saved as draft');
    });

    test('should publish workshop directly', async ({ page }) => {
      // Login as coordinator
      await page.fill('[data-testid="email-input"]', 'coordinator@educaloi.qc.ca');
      await page.fill('[data-testid="password-input"]', 'SecurePass123!');
      await page.click('[data-testid="login-button"]');
      
      await page.goto('/coordinator/workshops');
      await page.click('[data-testid="create-workshop-button"]');
      
      // Fill complete form
      await page.fill('[data-testid="form-title"]', 'Corporate Law Workshop');
      await page.fill('[data-testid="form-description"]', 'Learn the fundamentals of corporate law');
      await page.fill('[data-testid="form-date"]', '2024-07-20');
      await page.fill('[data-testid="form-start-time"]', '14:00');
      await page.fill('[data-testid="form-end-time"]', '17:00');
      await page.fill('[data-testid="form-location-name"]', 'Quebec City College');
      await page.fill('[data-testid="form-location-address"]', '456 University Ave, Quebec City, QC');
      await page.fill('[data-testid="form-max-volunteers"]', '3');
      
      // Fill contact person
      await page.fill('[data-testid="form-contact-name"]', 'Marie Dubois');
      await page.fill('[data-testid="form-contact-email"]', 'm.dubois@college.qc.ca');
      await page.fill('[data-testid="form-contact-phone"]', '+1-418-555-0123');
      
      // Publish directly
      await page.click('[data-testid="publish-button"]');
      
      // Check success message
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="success-message"]')).toContainText('Workshop published successfully');
    });

    test('should display coordinator workshop dashboard', async ({ page }) => {
      // Login as coordinator
      await page.fill('[data-testid="email-input"]', 'coordinator@educaloi.qc.ca');
      await page.fill('[data-testid="password-input"]', 'SecurePass123!');
      await page.click('[data-testid="login-button"]');
      
      await page.goto('/coordinator/workshops');
      
      // Check dashboard elements
      await expect(page.locator('[data-testid="workshop-stats"]')).toBeVisible();
      await expect(page.locator('[data-testid="stats-total"]')).toBeVisible();
      await expect(page.locator('[data-testid="stats-draft"]')).toBeVisible();
      await expect(page.locator('[data-testid="stats-published"]')).toBeVisible();
      await expect(page.locator('[data-testid="stats-completed"]')).toBeVisible();
      
      await expect(page.locator('[data-testid="my-workshops-list"]')).toBeVisible();
      await expect(page.locator('[data-testid="create-workshop-button"]')).toBeVisible();
    });

    test('should edit existing workshop', async ({ page }) => {
      // Login as coordinator
      await page.fill('[data-testid="email-input"]', 'coordinator@educaloi.qc.ca');
      await page.fill('[data-testid="password-input"]', 'SecurePass123!');
      await page.click('[data-testid="login-button"]');
      
      await page.goto('/coordinator/workshops');
      
      // Click edit on first workshop
      await page.click('[data-testid="workshop-edit-button"]');
      
      // Update title
      await page.fill('[data-testid="form-title"]', 'Updated Workshop Title');
      
      // Save changes
      await page.click('[data-testid="save-button"]');
      
      // Check success message
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    });

    test('should change workshop status', async ({ page }) => {
      // Login as coordinator
      await page.fill('[data-testid="email-input"]', 'coordinator@educaloi.qc.ca');
      await page.fill('[data-testid="password-input"]', 'SecurePass123!');
      await page.click('[data-testid="login-button"]');
      
      await page.goto('/coordinator/workshops');
      
      // Click on workshop status dropdown
      await page.click('[data-testid="workshop-status-dropdown"]');
      
      // Change to published
      await page.click('[data-testid="status-published"]');
      
      // Confirm change
      await page.click('[data-testid="confirm-status-change"]');
      
      // Check success message
      await expect(page.locator('[data-testid="status-updated-message"]')).toBeVisible();
    });

    test('should delete workshop with confirmation', async ({ page }) => {
      // Login as coordinator
      await page.fill('[data-testid="email-input"]', 'coordinator@educaloi.qc.ca');
      await page.fill('[data-testid="password-input"]', 'SecurePass123!');
      await page.click('[data-testid="login-button"]');
      
      await page.goto('/coordinator/workshops');
      
      // Click delete button
      await page.click('[data-testid="workshop-delete-button"]');
      
      // Check confirmation dialog
      await expect(page.locator('[data-testid="delete-confirmation-dialog"]')).toBeVisible();
      await expect(page.locator('[data-testid="delete-warning-text"]')).toBeVisible();
      
      // Confirm deletion
      await page.click('[data-testid="confirm-delete-button"]');
      
      // Check success message
      await expect(page.locator('[data-testid="delete-success-message"]')).toBeVisible();
    });
  });

  test.describe('MVP.4F.3 - Workshop Application Flow', () => {
    
    test('should allow volunteer to apply for workshop', async ({ page }) => {
      // Login as volunteer
      await page.fill('[data-testid="email-input"]', 'volunteer@example.com');
      await page.fill('[data-testid="password-input"]', 'SecurePass123!');
      await page.click('[data-testid="login-button"]');
      
      await page.goto('/workshops');
      
      // Click apply button on first workshop
      await page.click('[data-testid="apply-button"]');
      
      // Check application modal
      await expect(page.locator('[data-testid="application-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="application-form"]')).toBeVisible();
      
      // Fill application details
      await page.fill('[data-testid="application-message"]', 'I am interested in participating in this workshop');
      await page.selectOption('[data-testid="availability-confirmation"]', 'confirmed');
      
      // Submit application
      await page.click('[data-testid="submit-application-button"]');
      
      // Check success message
      await expect(page.locator('[data-testid="application-submitted-message"]')).toBeVisible();
    });

    test('should show application status in workshop card', async ({ page }) => {
      // Login as volunteer
      await page.fill('[data-testid="email-input"]', 'volunteer@example.com');
      await page.fill('[data-testid="password-input"]', 'SecurePass123!');
      await page.click('[data-testid="login-button"]');
      
      await page.goto('/workshops');
      
      // Check for applied workshops
      const appliedWorkshops = page.locator('[data-testid="workshop-card"][data-applied="true"]');
      
      if (await appliedWorkshops.count() > 0) {
        await expect(appliedWorkshops.first().locator('[data-testid="application-status"]')).toBeVisible();
        await expect(appliedWorkshops.first().locator('[data-testid="application-status"]')).toContainText('Applied');
      }
    });

    test('should display volunteer application history', async ({ page }) => {
      // Login as volunteer
      await page.fill('[data-testid="email-input"]', 'volunteer@example.com');
      await page.fill('[data-testid="password-input"]', 'SecurePass123!');
      await page.click('[data-testid="login-button"]');
      
      await page.goto('/applications');
      
      // Check application history components
      await expect(page.locator('[data-testid="application-history"]')).toBeVisible();
      await expect(page.locator('[data-testid="application-filters"]')).toBeVisible();
      
      // Check filter options
      await expect(page.locator('[data-testid="filter-status"]')).toBeVisible();
      await expect(page.locator('[data-testid="filter-date-range"]')).toBeVisible();
    });
  });

  test.describe('MVP.4F.4 - Workshop Form Validation', () => {
    
    test('should validate required fields in workshop creation', async ({ page }) => {
      // Login as coordinator
      await page.fill('[data-testid="email-input"]', 'coordinator@educaloi.qc.ca');
      await page.fill('[data-testid="password-input"]', 'SecurePass123!');
      await page.click('[data-testid="login-button"]');
      
      await page.goto('/coordinator/workshops');
      await page.click('[data-testid="create-workshop-button"]');
      
      // Try to save without filling required fields
      await page.click('[data-testid="save-draft-button"]');
      
      // Check validation errors
      await expect(page.locator('[data-testid="error-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-description"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-date"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-start-time"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-end-time"]')).toBeVisible();
    });

    test('should validate date is not in the past', async ({ page }) => {
      // Login as coordinator
      await page.fill('[data-testid="email-input"]', 'coordinator@educaloi.qc.ca');
      await page.fill('[data-testid="password-input"]', 'SecurePass123!');
      await page.click('[data-testid="login-button"]');
      
      await page.goto('/coordinator/workshops');
      await page.click('[data-testid="create-workshop-button"]');
      
      // Fill form with past date
      await page.fill('[data-testid="form-title"]', 'Test Workshop');
      await page.fill('[data-testid="form-description"]', 'Test description');
      await page.fill('[data-testid="form-date"]', '2020-01-01'); // Past date
      await page.fill('[data-testid="form-start-time"]', '09:00');
      await page.fill('[data-testid="form-end-time"]', '12:00');
      
      await page.click('[data-testid="save-draft-button"]');
      
      // Check date validation error
      await expect(page.locator('[data-testid="error-date"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-date"]')).toContainText('cannot be in the past');
    });

    test('should validate end time is after start time', async ({ page }) => {
      // Login as coordinator
      await page.fill('[data-testid="email-input"]', 'coordinator@educaloi.qc.ca');
      await page.fill('[data-testid="password-input"]', 'SecurePass123!');
      await page.click('[data-testid="login-button"]');
      
      await page.goto('/coordinator/workshops');
      await page.click('[data-testid="create-workshop-button"]');
      
      // Fill form with invalid times
      await page.fill('[data-testid="form-title"]', 'Test Workshop');
      await page.fill('[data-testid="form-description"]', 'Test description');
      await page.fill('[data-testid="form-date"]', '2024-12-31');
      await page.fill('[data-testid="form-start-time"]', '15:00');
      await page.fill('[data-testid="form-end-time"]', '12:00'); // Before start time
      
      await page.click('[data-testid="save-draft-button"]');
      
      // Check time validation error
      await expect(page.locator('[data-testid="error-end-time"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-end-time"]')).toContainText('must be after start time');
    });

    test('should validate email format in contact person', async ({ page }) => {
      // Login as coordinator
      await page.fill('[data-testid="email-input"]', 'coordinator@educaloi.qc.ca');
      await page.fill('[data-testid="password-input"]', 'SecurePass123!');
      await page.click('[data-testid="login-button"]');
      
      await page.goto('/coordinator/workshops');
      await page.click('[data-testid="create-workshop-button"]');
      
      // Fill form with invalid email
      await page.fill('[data-testid="form-contact-email"]', 'invalid-email');
      
      // Click away to trigger validation
      await page.click('[data-testid="form-title"]');
      
      // Check email validation error
      await expect(page.locator('[data-testid="error-contact-email"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-contact-email"]')).toContainText('valid email');
    });
  });

  test.describe('MVP.4F.5 - Workshop UI/UX Features', () => {
    
    test('should display workshop loading states', async ({ page }) => {
      // Login as volunteer
      await page.fill('[data-testid="email-input"]', 'volunteer@example.com');
      await page.fill('[data-testid="password-input"]', 'SecurePass123!');
      await page.click('[data-testid="login-button"]');
      
      await page.goto('/workshops');
      
      // Check loading skeleton
      await expect(page.locator('[data-testid="workshop-loading-skeleton"]')).toBeVisible({ timeout: 1000 });
    });

    test('should display empty states when no workshops available', async ({ page }) => {
      // Login as volunteer
      await page.fill('[data-testid="email-input"]', 'volunteer@example.com');
      await page.fill('[data-testid="password-input"]', 'SecurePass123!');
      await page.click('[data-testid="login-button"]');
      
      await page.goto('/workshops');
      
      // Apply filters that would result in no matches
      await page.selectOption('[data-testid="filter-region"]', 'NonExistentRegion');
      
      // Check empty state
      await expect(page.locator('[data-testid="empty-workshops-state"]')).toBeVisible();
      await expect(page.locator('[data-testid="empty-state-message"]')).toContainText('No workshops found');
    });

    test('should be responsive on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Login as volunteer
      await page.fill('[data-testid="email-input"]', 'volunteer@example.com');
      await page.fill('[data-testid="password-input"]', 'SecurePass123!');
      await page.click('[data-testid="login-button"]');
      
      await page.goto('/workshops');
      
      // Check mobile navigation
      await expect(page.locator('[data-testid="mobile-menu-toggle"]')).toBeVisible();
      
      // Check workshop cards are stacked
      const workshopCards = page.locator('[data-testid="workshop-card"]');
      if (await workshopCards.count() > 1) {
        const firstCard = workshopCards.first();
        const secondCard = workshopCards.nth(1);
        
        const firstCardBox = await firstCard.boundingBox();
        const secondCardBox = await secondCard.boundingBox();
        
        // Cards should be stacked vertically on mobile
        expect(secondCardBox!.y).toBeGreaterThan(firstCardBox!.y + firstCardBox!.height);
      }
    });

    test('should support keyboard navigation', async ({ page }) => {
      // Login as volunteer
      await page.fill('[data-testid="email-input"]', 'volunteer@example.com');
      await page.fill('[data-testid="password-input"]', 'SecurePass123!');
      await page.click('[data-testid="login-button"]');
      
      await page.goto('/workshops');
      
      // Navigate using keyboard
      await page.keyboard.press('Tab'); // Focus first workshop card
      await page.keyboard.press('Enter'); // Open workshop detail
      
      // Check modal opened
      await expect(page.locator('[data-testid="workshop-detail-modal"]')).toBeVisible();
      
      // Close with Escape
      await page.keyboard.press('Escape');
      await expect(page.locator('[data-testid="workshop-detail-modal"]')).not.toBeVisible();
    });

    test('should display workshop status indicators', async ({ page }) => {
      // Login as coordinator to see all statuses
      await page.fill('[data-testid="email-input"]', 'coordinator@educaloi.qc.ca');
      await page.fill('[data-testid="password-input"]', 'SecurePass123!');
      await page.click('[data-testid="login-button"]');
      
      await page.goto('/coordinator/workshops');
      
      // Check status indicators exist
      const statusIndicators = page.locator('[data-testid="workshop-status-indicator"]');
      
      if (await statusIndicators.count() > 0) {
        // Check different status colors/styles
        await expect(statusIndicators.first()).toBeVisible();
        
        // Check status text
        const statusText = await statusIndicators.first().textContent();
        expect(['Draft', 'Published', 'Cancelled', 'Completed']).toContain(statusText?.trim());
      }
    });
  });

  test.describe('MVP.4F.6 - Workshop Search and Filtering', () => {
    
    test('should persist filters in URL', async ({ page }) => {
      // Login as volunteer
      await page.fill('[data-testid="email-input"]', 'volunteer@example.com');
      await page.fill('[data-testid="password-input"]', 'SecurePass123!');
      await page.click('[data-testid="login-button"]');
      
      await page.goto('/workshops');
      
      // Apply filters
      await page.selectOption('[data-testid="filter-region"]', 'Montreal');
      await page.selectOption('[data-testid="filter-specialization"]', 'Employment Law');
      
      // Check URL contains filter parameters
      await expect(page).toHaveURL(/region=Montreal/);
      await expect(page).toHaveURL(/specialization=Employment/);
      
      // Refresh page and check filters are maintained
      await page.reload();
      
      const regionValue = await page.locator('[data-testid="filter-region"]').inputValue();
      const specializationValue = await page.locator('[data-testid="filter-specialization"]').inputValue();
      
      expect(regionValue).toBe('Montreal');
      expect(specializationValue).toBe('Employment Law');
    });

    test('should clear all filters', async ({ page }) => {
      // Login as volunteer
      await page.fill('[data-testid="email-input"]', 'volunteer@example.com');
      await page.fill('[data-testid="password-input"]', 'SecurePass123!');
      await page.click('[data-testid="login-button"]');
      
      await page.goto('/workshops');
      
      // Apply multiple filters
      await page.selectOption('[data-testid="filter-region"]', 'Montreal');
      await page.fill('[data-testid="search-workshops"]', 'employment');
      
      // Clear all filters
      await page.click('[data-testid="clear-filters-button"]');
      
      // Check filters are cleared
      expect(await page.locator('[data-testid="filter-region"]').inputValue()).toBe('');
      expect(await page.locator('[data-testid="search-workshops"]').inputValue()).toBe('');
    });

    test('should show search suggestions', async ({ page }) => {
      // Login as volunteer
      await page.fill('[data-testid="email-input"]', 'volunteer@example.com');
      await page.fill('[data-testid="password-input"]', 'SecurePass123!');
      await page.click('[data-testid="login-button"]');
      
      await page.goto('/workshops');
      
      // Start typing in search box
      await page.fill('[data-testid="search-workshops"]', 'emp');
      
      // Check search suggestions appear
      await expect(page.locator('[data-testid="search-suggestions"]')).toBeVisible();
      await expect(page.locator('[data-testid="suggestion-item"]')).toHaveCount(3, { timeout: 2000 });
    });
  });
});
