// MVP.3F.1: Profile Management E2E Tests
// Test-Driven Development for Profile Creation and Management

import { test, expect } from '@playwright/test';

test.describe('MVP.3F Frontend Profile Management Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app and ensure we're logged in
    await page.goto('/');
  });

  test.describe('MVP.3F.6 Profile Creation Form Tests', () => {
    test('should display profile creation wizard', async ({ page }) => {
      // Login as volunteer first
      await page.click('text=Login');
      await page.fill('[data-testid="email-input"]', 'volunteer@test.com');
      await page.fill('[data-testid="password-input"]', 'TestPass123!');
      await page.click('[data-testid="login-button"]');
      
      // Navigate to profile creation
      await page.click('text=Edit Profile');
      
      // Check wizard structure
      await expect(page.locator('[data-testid="profile-wizard"]')).toBeVisible();
      await expect(page.locator('[data-testid="wizard-step-1"]')).toBeVisible();
      await expect(page.locator('text=Personal Information')).toBeVisible();
    });

    test('should navigate through wizard steps', async ({ page }) => {
      // Login and navigate to profile
      await page.click('text=Login');
      await page.fill('[data-testid="email-input"]', 'volunteer@test.com');
      await page.fill('[data-testid="password-input"]', 'TestPass123!');
      await page.click('[data-testid="login-button"]');
      await page.click('text=Edit Profile');
      
      // Step 1: Personal Information
      await page.fill('[data-testid="phone-input"]', '514-555-0123');
      await page.click('[data-testid="next-step-button"]');
      
      // Step 2: Professional Information
      await expect(page.locator('[data-testid="wizard-step-2"]')).toBeVisible();
      await expect(page.locator('text=Professional Information')).toBeVisible();
      
      // Step 3: Availability
      await page.click('[data-testid="next-step-button"]');
      await expect(page.locator('[data-testid="wizard-step-3"]')).toBeVisible();
      await expect(page.locator('text=Availability')).toBeVisible();
    });

    test('should validate required fields in wizard', async ({ page }) => {
      await page.click('text=Login');
      await page.fill('[data-testid="email-input"]', 'volunteer@test.com');
      await page.fill('[data-testid="password-input"]', 'TestPass123!');
      await page.click('[data-testid="login-button"]');
      await page.click('text=Edit Profile');
      
      // Try to proceed without filling required fields
      await page.click('[data-testid="next-step-button"]');
      
      // Should show validation errors
      await expect(page.locator('[data-testid="phone-error"]')).toBeVisible();
      await expect(page.locator('text=Phone number is required')).toBeVisible();
    });
  });

  test.describe('MVP.3F.7 Profile Editing Interface Tests', () => {
    test('should display existing profile data', async ({ page }) => {
      await page.click('text=Login');
      await page.fill('[data-testid="email-input"]', 'volunteer@test.com');
      await page.fill('[data-testid="password-input"]', 'TestPass123!');
      await page.click('[data-testid="login-button"]');
      await page.click('text=Edit Profile');
      
      // Should load existing profile data
      await expect(page.locator('[data-testid="profile-form"]')).toBeVisible();
      await expect(page.locator('[data-testid="edit-mode-toggle"]')).toBeVisible();
    });

    test('should enable live validation', async ({ page }) => {
      await page.click('text=Login');
      await page.fill('[data-testid="email-input"]', 'volunteer@test.com');
      await page.fill('[data-testid="password-input"]', 'TestPass123!');
      await page.click('[data-testid="login-button"]');
      await page.click('text=Edit Profile');
      
      // Test phone validation
      await page.fill('[data-testid="phone-input"]', 'invalid-phone');
      await page.blur('[data-testid="phone-input"]');
      await expect(page.locator('[data-testid="phone-validation-error"]')).toBeVisible();
      
      // Test valid phone
      await page.fill('[data-testid="phone-input"]', '514-555-0123');
      await page.blur('[data-testid="phone-input"]');
      await expect(page.locator('[data-testid="phone-validation-success"]')).toBeVisible();
    });

    test('should save profile changes', async ({ page }) => {
      await page.click('text=Login');
      await page.fill('[data-testid="email-input"]', 'volunteer@test.com');
      await page.fill('[data-testid="password-input"]', 'TestPass123!');
      await page.click('[data-testid="login-button"]');
      await page.click('text=Edit Profile');
      
      // Make changes
      await page.fill('[data-testid="phone-input"]', '514-555-9999');
      await page.click('[data-testid="save-profile-button"]');
      
      // Should show success message
      await expect(page.locator('[data-testid="profile-save-success"]')).toBeVisible();
      await expect(page.locator('text=Profile updated successfully')).toBeVisible();
    });
  });

  test.describe('MVP.3F.8 Profile Photo Upload Tests', () => {
    test('should display photo upload interface', async ({ page }) => {
      await page.click('text=Login');
      await page.fill('[data-testid="email-input"]', 'volunteer@test.com');
      await page.fill('[data-testid="password-input"]', 'TestPass123!');
      await page.click('[data-testid="login-button"]');
      await page.click('text=Edit Profile');
      
      await expect(page.locator('[data-testid="photo-upload-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="photo-upload-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="photo-preview"]')).toBeVisible();
    });

    test('should preview uploaded photo', async ({ page }) => {
      await page.click('text=Login');
      await page.fill('[data-testid="email-input"]', 'volunteer@test.com');
      await page.fill('[data-testid="password-input"]', 'TestPass123!');
      await page.click('[data-testid="login-button"]');
      await page.click('text=Edit Profile');
      
      // Upload photo (mock file)
      const fileInput = page.locator('[data-testid="photo-file-input"]');
      // Note: In real test, we'd upload a test image file
      await expect(fileInput).toBeAttached();
    });
  });

  test.describe('MVP.3F.9 Specialization Multi-Select Tests', () => {
    test('should display specialization options', async ({ page }) => {
      await page.click('text=Login');
      await page.fill('[data-testid="email-input"]', 'volunteer@test.com');
      await page.fill('[data-testid="password-input"]', 'TestPass123!');
      await page.click('[data-testid="login-button"]');
      await page.click('text=Edit Profile');
      
      await expect(page.locator('[data-testid="specialization-select"]')).toBeVisible();
      await page.click('[data-testid="specialization-select"]');
      
      // Should show specialization options
      await expect(page.locator('text=Criminal Law')).toBeVisible();
      await expect(page.locator('text=Family Law')).toBeVisible();
      await expect(page.locator('text=Employment Law')).toBeVisible();
    });

    test('should allow multiple specialization selection', async ({ page }) => {
      await page.click('text=Login');
      await page.fill('[data-testid="email-input"]', 'volunteer@test.com');
      await page.fill('[data-testid="password-input"]', 'TestPass123!');
      await page.click('[data-testid="login-button"]');
      await page.click('text=Edit Profile');
      
      // Select multiple specializations
      await page.click('[data-testid="specialization-select"]');
      await page.click('text=Criminal Law');
      await page.click('text=Family Law');
      
      // Should show selected items
      await expect(page.locator('[data-testid="selected-specialization-criminal"]')).toBeVisible();
      await expect(page.locator('[data-testid="selected-specialization-family"]')).toBeVisible();
    });

    test('should search specializations', async ({ page }) => {
      await page.click('text=Login');
      await page.fill('[data-testid="email-input"]', 'volunteer@test.com');
      await page.fill('[data-testid="password-input"]', 'TestPass123!');
      await page.click('[data-testid="login-button"]');
      await page.click('text=Edit Profile');
      
      await page.click('[data-testid="specialization-select"]');
      await page.fill('[data-testid="specialization-search"]', 'criminal');
      
      // Should filter results
      await expect(page.locator('text=Criminal Law')).toBeVisible();
      await expect(page.locator('text=Family Law')).not.toBeVisible();
    });
  });

  test.describe('MVP.3F.10 Availability Calendar Tests', () => {
    test('should display availability calendar', async ({ page }) => {
      await page.click('text=Login');
      await page.fill('[data-testid="email-input"]', 'volunteer@test.com');
      await page.fill('[data-testid="password-input"]', 'TestPass123!');
      await page.click('[data-testid="login-button"]');
      await page.click('text=Edit Profile');
      
      await expect(page.locator('[data-testid="availability-calendar"]')).toBeVisible();
      await expect(page.locator('[data-testid="calendar-header"]')).toBeVisible();
    });

    test('should allow time slot selection', async ({ page }) => {
      await page.click('text=Login');
      await page.fill('[data-testid="email-input"]', 'volunteer@test.com');
      await page.fill('[data-testid="password-input"]', 'TestPass123!');
      await page.click('[data-testid="login-button"]');
      await page.click('text=Edit Profile');
      
      // Select available time slots
      await page.click('[data-testid="time-slot-monday-morning"]');
      await page.click('[data-testid="time-slot-wednesday-afternoon"]');
      
      // Should show selected slots
      await expect(page.locator('[data-testid="selected-slot-monday-morning"]')).toHaveClass(/selected/);
      await expect(page.locator('[data-testid="selected-slot-wednesday-afternoon"]')).toHaveClass(/selected/);
    });

    test('should set maximum workshops per month', async ({ page }) => {
      await page.click('text=Login');
      await page.fill('[data-testid="email-input"]', 'volunteer@test.com');
      await page.fill('[data-testid="password-input"]', 'TestPass123!');
      await page.click('[data-testid="login-button"]');
      await page.click('text=Edit Profile');
      
      await page.fill('[data-testid="max-workshops-input"]', '3');
      await expect(page.locator('[data-testid="max-workshops-input"]')).toHaveValue('3');
    });
  });

  test.describe('MVP.3F.11 Profile Completeness Indicator Tests', () => {
    test('should show profile completeness percentage', async ({ page }) => {
      await page.click('text=Login');
      await page.fill('[data-testid="email-input"]', 'volunteer@test.com');
      await page.fill('[data-testid="password-input"]', 'TestPass123!');
      await page.click('[data-testid="login-button"]');
      await page.click('text=Edit Profile');
      
      await expect(page.locator('[data-testid="profile-completeness"]')).toBeVisible();
      await expect(page.locator('[data-testid="completeness-percentage"]')).toBeVisible();
      await expect(page.locator('[data-testid="completeness-bar"]')).toBeVisible();
    });

    test('should update completeness as fields are filled', async ({ page }) => {
      await page.click('text=Login');
      await page.fill('[data-testid="email-input"]', 'volunteer@test.com');
      await page.fill('[data-testid="password-input"]', 'TestPass123!');
      await page.click('[data-testid="login-button"]');
      await page.click('text=Edit Profile');
      
      // Initial completeness
      const initialPercentage = await page.locator('[data-testid="completeness-percentage"]').textContent();
      
      // Fill a field
      await page.fill('[data-testid="phone-input"]', '514-555-0123');
      
      // Completeness should increase
      const newPercentage = await page.locator('[data-testid="completeness-percentage"]').textContent();
      expect(newPercentage).not.toBe(initialPercentage);
    });

    test('should show missing field recommendations', async ({ page }) => {
      await page.click('text=Login');
      await page.fill('[data-testid="email-input"]', 'volunteer@test.com');
      await page.fill('[data-testid="password-input"]', 'TestPass123!');
      await page.click('[data-testid="login-button"]');
      await page.click('text=Edit Profile');
      
      await expect(page.locator('[data-testid="missing-fields-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="missing-field-item"]')).toBeVisible();
    });
  });

  test.describe('MVP.3F.12 Coordinator Profile Search Tests', () => {
    test('should display volunteer search interface for coordinators', async ({ page }) => {
      // Login as coordinator
      await page.click('text=Login');
      await page.fill('[data-testid="email-input"]', 'coordinator@test.com');
      await page.fill('[data-testid="password-input"]', 'TestPass123!');
      await page.click('[data-testid="login-button"]');
      
      // Navigate to volunteer search
      await page.click('text=View Volunteers');
      
      await expect(page.locator('[data-testid="volunteer-search"]')).toBeVisible();
      await expect(page.locator('[data-testid="search-filters"]')).toBeVisible();
    });

    test('should search volunteers by specialization', async ({ page }) => {
      await page.click('text=Login');
      await page.fill('[data-testid="email-input"]', 'coordinator@test.com');
      await page.fill('[data-testid="password-input"]', 'TestPass123!');
      await page.click('[data-testid="login-button"]');
      await page.click('text=View Volunteers');
      
      // Filter by specialization
      await page.click('[data-testid="specialization-filter"]');
      await page.click('text=Criminal Law');
      await page.click('[data-testid="apply-filters-button"]');
      
      // Should show filtered results
      await expect(page.locator('[data-testid="volunteer-results"]')).toBeVisible();
    });

    test('should search volunteers by availability', async ({ page }) => {
      await page.click('text=Login');
      await page.fill('[data-testid="email-input"]', 'coordinator@test.com');
      await page.fill('[data-testid="password-input"]', 'TestPass123!');
      await page.click('[data-testid="login-button"]');
      await page.click('text=View Volunteers');
      
      // Filter by availability
      await page.click('[data-testid="availability-filter"]');
      await page.click('text=Monday Morning');
      await page.click('[data-testid="apply-filters-button"]');
      
      await expect(page.locator('[data-testid="volunteer-results"]')).toBeVisible();
    });

    test('should display volunteer profile details', async ({ page }) => {
      await page.click('text=Login');
      await page.fill('[data-testid="email-input"]', 'coordinator@test.com');
      await page.fill('[data-testid="password-input"]', 'TestPass123!');
      await page.click('[data-testid="login-button"]');
      await page.click('text=View Volunteers');
      
      // Click on a volunteer profile
      await page.click('[data-testid="volunteer-card-1"]');
      
      // Should show detailed profile modal
      await expect(page.locator('[data-testid="volunteer-detail-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="volunteer-contact-info"]')).toBeVisible();
      await expect(page.locator('[data-testid="volunteer-specializations"]')).toBeVisible();
    });
  });

  test.describe('Profile Integration Tests', () => {
    test('should integrate with authentication system', async ({ page }) => {
      // Should redirect to login if not authenticated
      await page.goto('/profile');
      await expect(page).toHaveURL(/.*login/);
    });

    test('should maintain profile data across sessions', async ({ page }) => {
      // Login and create profile
      await page.click('text=Login');
      await page.fill('[data-testid="email-input"]', 'volunteer@test.com');
      await page.fill('[data-testid="password-input"]', 'TestPass123!');
      await page.click('[data-testid="login-button"]');
      await page.click('text=Edit Profile');
      
      await page.fill('[data-testid="phone-input"]', '514-555-1234');
      await page.click('[data-testid="save-profile-button"]');
      
      // Logout and login again
      await page.click('[data-testid="logout-button"]');
      await page.click('text=Login');
      await page.fill('[data-testid="email-input"]', 'volunteer@test.com');
      await page.fill('[data-testid="password-input"]', 'TestPass123!');
      await page.click('[data-testid="login-button"]');
      await page.click('text=Edit Profile');
      
      // Should maintain saved data
      await expect(page.locator('[data-testid="phone-input"]')).toHaveValue('514-555-1234');
    });

    test('should handle API errors gracefully', async ({ page }) => {
      await page.click('text=Login');
      await page.fill('[data-testid="email-input"]', 'volunteer@test.com');
      await page.fill('[data-testid="password-input"]', 'TestPass123!');
      await page.click('[data-testid="login-button"]');
      await page.click('text=Edit Profile');
      
      // Mock API error
      await page.route('**/api/profiles/**', route => route.fulfill({
        status: 500,
        body: 'Server Error'
      }));
      
      await page.click('[data-testid="save-profile-button"]');
      
      // Should show error message
      await expect(page.locator('[data-testid="profile-save-error"]')).toBeVisible();
      await expect(page.locator('text=Failed to save profile')).toBeVisible();
    });
  });
}); 