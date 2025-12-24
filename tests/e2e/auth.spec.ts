import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    await expect(page).toHaveURL(/\/login/);
  });

  test('should display login form', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should show validation errors for empty form submission', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should show validation errors
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await expect(page.getByText(/invalid email/i)).toBeVisible();
  });

  test('should have accessible form labels', async ({ page }) => {
    await page.goto('/login');
    
    // Check that form inputs have proper labels
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    
    await expect(emailInput).toHaveAttribute('type', 'email');
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should navigate between form fields with keyboard', async ({ page }) => {
    await page.goto('/login');
    
    // Focus email input
    await page.getByLabel(/email/i).focus();
    await expect(page.getByLabel(/email/i)).toBeFocused();
    
    // Tab to password
    await page.keyboard.press('Tab');
    await expect(page.getByLabel(/password/i)).toBeFocused();
    
    // Tab to submit button
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: /sign in/i })).toBeFocused();
  });
});

test.describe('Protected Routes', () => {
  test('should redirect to login from dashboard when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect to login from contacts when not authenticated', async ({ page }) => {
    await page.goto('/contacts');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect to login from organizations when not authenticated', async ({ page }) => {
    await page.goto('/organizations');
    await expect(page).toHaveURL(/\/login/);
  });
});

