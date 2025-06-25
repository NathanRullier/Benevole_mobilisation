import { test, expect } from '@playwright/test';

test.describe('MVP.2F Frontend Authentication System Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app before each test
    await page.goto('/');
  });

  test.describe('MVP.2F.6 User Registration Form Tests', () => {
    test('should display registration form', async ({ page }) => {
      await page.goto('/register');
      
      // Check form fields are present
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
      await expect(page.locator('input[name="firstName"]')).toBeVisible();
      await expect(page.locator('input[name="lastName"]')).toBeVisible();
      await expect(page.locator('select[name="role"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      await page.goto('/register');
      
      // Try to submit empty form
      await page.click('button[type="submit"]');
      
      // Check for validation errors
      await expect(page.getByText('Email is required')).toBeVisible();
      await expect(page.getByText('Password is required')).toBeVisible();
      await expect(page.getByText('First name is required')).toBeVisible();
      await expect(page.getByText('Last name is required')).toBeVisible();
    });

    test('should validate email format', async ({ page }) => {
      await page.goto('/register');
      
      await page.fill('input[name="email"]', 'invalid-email');
      await page.click('button[type="submit"]');
      
      await expect(page.getByText('Please enter a valid email address')).toBeVisible();
    });

    test('should validate password strength', async ({ page }) => {
      await page.goto('/register');
      
      // Test weak password
      await page.fill('input[name="password"]', '123');
      await page.blur('input[name="password"]');
      
      await expect(page.getByText('Password must be at least 8 characters')).toBeVisible();
      
      // Test password without special characters
      await page.fill('input[name="password"]', 'simplepass');
      await page.blur('input[name="password"]');
      
      await expect(page.getByText('Password must contain at least one special character')).toBeVisible();
    });

    test('should show password strength indicator', async ({ page }) => {
      await page.goto('/register');
      
      // Weak password
      await page.fill('input[name="password"]', '123');
      await expect(page.locator('[data-testid="password-strength-weak"]')).toBeVisible();
      
      // Strong password
      await page.fill('input[name="password"]', 'StrongPass123!');
      await expect(page.locator('[data-testid="password-strength-strong"]')).toBeVisible();
    });

    test('should validate password confirmation', async ({ page }) => {
      await page.goto('/register');
      
      await page.fill('input[name="password"]', 'StrongPass123!');
      await page.fill('input[name="confirmPassword"]', 'DifferentPass123!');
      await page.click('button[type="submit"]');
      
      await expect(page.getByText('Passwords do not match')).toBeVisible();
    });

    test('should submit registration form with valid data', async ({ page }) => {
      await page.goto('/register');
      
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'StrongPass123!');
      await page.fill('input[name="confirmPassword"]', 'StrongPass123!');
      await page.fill('input[name="firstName"]', 'John');
      await page.fill('input[name="lastName"]', 'Doe');
      await page.selectOption('select[name="role"]', 'volunteer');
      
      // Mock successful registration
      await page.route('**/api/v1/auth/register', async route => {
        await route.fulfill({
          status: 201,
          body: JSON.stringify({
            message: 'User registered successfully',
            userId: 'test-user-id',
            user: {
              id: 'test-user-id',
              email: 'test@example.com',
              firstName: 'John',
              lastName: 'Doe',
              role: 'volunteer'
            }
          })
        });
      });
      
      await page.click('button[type="submit"]');
      
      // Should redirect to login page after successful registration
      await expect(page).toHaveURL('/login');
      await expect(page.getByText('Registration successful! Please log in.')).toBeVisible();
    });
  });

  test.describe('MVP.2F.7 Login Form Tests', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/login');
      
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      await expect(page.getByText('Register')).toBeVisible(); // Link to registration
    });

    test('should validate login form fields', async ({ page }) => {
      await page.goto('/login');
      
      await page.click('button[type="submit"]');
      
      await expect(page.getByText('Email is required')).toBeVisible();
      await expect(page.getByText('Password is required')).toBeVisible();
    });

    test('should handle login with invalid credentials', async ({ page }) => {
      await page.goto('/login');
      
      // Mock failed login
      await page.route('**/api/v1/auth/login', async route => {
        await route.fulfill({
          status: 401,
          body: JSON.stringify({
            message: 'Invalid credentials'
          })
        });
      });
      
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
      
      await expect(page.getByText('Invalid credentials')).toBeVisible();
    });

    test('should handle successful login for volunteer', async ({ page }) => {
      await page.goto('/login');
      
      // Mock successful login
      await page.route('**/api/v1/auth/login', async route => {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            message: 'Login successful',
            token: 'mock-jwt-token',
            sessionId: 'mock-session-id',
            user: {
              id: 'user-123',
              email: 'volunteer@example.com',
              firstName: 'John',
              lastName: 'Volunteer',
              role: 'volunteer',
              isActive: true
            }
          })
        });
      });
      
      await page.fill('input[name="email"]', 'volunteer@example.com');
      await page.fill('input[name="password"]', 'StrongPass123!');
      await page.click('button[type="submit"]');
      
      // Should redirect to volunteer dashboard
      await expect(page).toHaveURL('/dashboard');
      await expect(page.getByText('Welcome, John!')).toBeVisible();
    });

    test('should handle successful login for coordinator', async ({ page }) => {
      await page.goto('/login');
      
      // Mock successful coordinator login
      await page.route('**/api/v1/auth/login', async route => {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            message: 'Login successful',
            token: 'mock-jwt-token',
            sessionId: 'mock-session-id',
            user: {
              id: 'coord-123',
              email: 'coordinator@example.com',
              firstName: 'Jane',
              lastName: 'Coordinator',
              role: 'coordinator',
              isActive: true
            }
          })
        });
      });
      
      await page.fill('input[name="email"]', 'coordinator@example.com');
      await page.fill('input[name="password"]', 'StrongPass123!');
      await page.click('button[type="submit"]');
      
      // Should redirect to coordinator dashboard
      await expect(page).toHaveURL('/coordinator/dashboard');
      await expect(page.getByText('Welcome, Jane!')).toBeVisible();
    });
  });

  test.describe('MVP.2F.8 JWT Token Storage and Management Tests', () => {
    test('should store JWT token in localStorage on login', async ({ page }) => {
      await page.goto('/login');
      
      await page.route('**/api/v1/auth/login', async route => {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            token: 'mock-jwt-token',
            user: { id: '123', email: 'test@example.com', role: 'volunteer' }
          })
        });
      });
      
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Check if token is stored
      const token = await page.evaluate(() => localStorage.getItem('auth_token'));
      expect(token).toBe('mock-jwt-token');
    });

    test('should include token in API requests', async ({ page }) => {
      // Set token in localStorage
      await page.addInitScript(() => {
        localStorage.setItem('auth_token', 'test-jwt-token');
      });
      
      await page.goto('/dashboard');
      
      // Check that API requests include the authorization header
      page.on('request', request => {
        if (request.url().includes('/api/v1/')) {
          expect(request.headers()['authorization']).toBe('Bearer test-jwt-token');
        }
      });
    });

    test('should clear token on logout', async ({ page }) => {
      // Set initial token
      await page.addInitScript(() => {
        localStorage.setItem('auth_token', 'test-jwt-token');
      });
      
      await page.goto('/dashboard');
      
      // Mock logout
      await page.route('**/api/v1/auth/logout', async route => {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ message: 'Successfully logged out' })
        });
      });
      
      await page.click('[data-testid="logout-button"]');
      
      // Check token is cleared
      const token = await page.evaluate(() => localStorage.getItem('auth_token'));
      expect(token).toBeNull();
      
      // Should redirect to login
      await expect(page).toHaveURL('/login');
    });
  });

  test.describe('MVP.2F.9 Protected Route Components Tests', () => {
    test('should redirect to login when accessing protected route without token', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Should redirect to login
      await expect(page).toHaveURL('/login');
      await expect(page.getByText('Please log in to access this page')).toBeVisible();
    });

    test('should allow access to protected route with valid token', async ({ page }) => {
      // Mock token verification
      await page.route('**/api/v1/auth/verify', async route => {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            valid: true,
            user: {
              id: '123',
              email: 'test@example.com',
              role: 'volunteer'
            }
          })
        });
      });
      
      await page.addInitScript(() => {
        localStorage.setItem('auth_token', 'valid-jwt-token');
      });
      
      await page.goto('/dashboard');
      
      // Should not redirect
      await expect(page).toHaveURL('/dashboard');
    });
  });

  test.describe('MVP.2F.10 Role-based UI Rendering Tests', () => {
    test('should show volunteer-specific UI elements', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('auth_token', 'volunteer-token');
        localStorage.setItem('user_data', JSON.stringify({
          id: '123',
          email: 'volunteer@example.com',
          role: 'volunteer'
        }));
      });
      
      await page.goto('/dashboard');
      
      // Should show volunteer navigation
      await expect(page.getByText('My Applications')).toBeVisible();
      await expect(page.getByText('Available Workshops')).toBeVisible();
      await expect(page.getByText('My Profile')).toBeVisible();
      
      // Should not show coordinator features
      await expect(page.getByText('Manage Workshops')).not.toBeVisible();
      await expect(page.getByText('View All Volunteers')).not.toBeVisible();
    });

    test('should show coordinator-specific UI elements', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('auth_token', 'coordinator-token');
        localStorage.setItem('user_data', JSON.stringify({
          id: '123',
          email: 'coordinator@example.com',
          role: 'coordinator'
        }));
      });
      
      await page.goto('/coordinator/dashboard');
      
      // Should show coordinator navigation
      await expect(page.getByText('Manage Workshops')).toBeVisible();
      await expect(page.getByText('View All Volunteers')).toBeVisible();
      await expect(page.getByText('Applications Review')).toBeVisible();
      
      // Should also have volunteer features (hierarchical)
      await expect(page.getByText('My Profile')).toBeVisible();
    });
  });

  test.describe('MVP.2F.11 Session Persistence and Auto-logout Tests', () => {
    test('should persist session across page reloads', async ({ page }) => {
      // Set auth data
      await page.addInitScript(() => {
        localStorage.setItem('auth_token', 'valid-token');
        localStorage.setItem('user_data', JSON.stringify({
          id: '123',
          email: 'test@example.com',
          role: 'volunteer'
        }));
      });
      
      await page.goto('/dashboard');
      await expect(page.getByText('Welcome')).toBeVisible();
      
      // Reload page
      await page.reload();
      
      // Should still be authenticated
      await expect(page.getByText('Welcome')).toBeVisible();
      await expect(page).toHaveURL('/dashboard');
    });

    test('should auto-logout on token expiration', async ({ page }) => {
      // Mock expired token
      await page.route('**/api/v1/auth/verify', async route => {
        await route.fulfill({
          status: 401,
          body: JSON.stringify({
            valid: false,
            message: 'Token expired'
          })
        });
      });
      
      await page.addInitScript(() => {
        localStorage.setItem('auth_token', 'expired-token');
      });
      
      await page.goto('/dashboard');
      
      // Should redirect to login
      await expect(page).toHaveURL('/login');
      await expect(page.getByText('Your session has expired. Please log in again.')).toBeVisible();
      
      // Token should be cleared
      const token = await page.evaluate(() => localStorage.getItem('auth_token'));
      expect(token).toBeNull();
    });
  });

  test.describe('MVP.2F.12 Password Strength Indicator Tests', () => {
    test('should show password strength levels', async ({ page }) => {
      await page.goto('/register');
      
      const passwordInput = page.locator('input[name="password"]');
      
      // Very weak
      await passwordInput.fill('123');
      await expect(page.locator('[data-testid="strength-very-weak"]')).toBeVisible();
      
      // Weak
      await passwordInput.fill('password');
      await expect(page.locator('[data-testid="strength-weak"]')).toBeVisible();
      
      // Fair
      await passwordInput.fill('password123');
      await expect(page.locator('[data-testid="strength-fair"]')).toBeVisible();
      
      // Good
      await passwordInput.fill('Password123');
      await expect(page.locator('[data-testid="strength-good"]')).toBeVisible();
      
      // Strong
      await passwordInput.fill('Password123!');
      await expect(page.locator('[data-testid="strength-strong"]')).toBeVisible();
    });

    test('should show password requirements checklist', async ({ page }) => {
      await page.goto('/register');
      
      const passwordInput = page.locator('input[name="password"]');
      
      await passwordInput.fill('P');
      
      // All requirements should be visible
      await expect(page.getByText('At least 8 characters')).toBeVisible();
      await expect(page.getByText('One uppercase letter')).toBeVisible();
      await expect(page.getByText('One lowercase letter')).toBeVisible();
      await expect(page.getByText('One number')).toBeVisible();
      await expect(page.getByText('One special character')).toBeVisible();
      
      // Fill strong password
      await passwordInput.fill('StrongPass123!');
      
      // All requirements should show as met
      await expect(page.locator('[data-testid="req-length-met"]')).toBeVisible();
      await expect(page.locator('[data-testid="req-uppercase-met"]')).toBeVisible();
      await expect(page.locator('[data-testid="req-lowercase-met"]')).toBeVisible();
      await expect(page.locator('[data-testid="req-number-met"]')).toBeVisible();
      await expect(page.locator('[data-testid="req-special-met"]')).toBeVisible();
    });
  });
}); 