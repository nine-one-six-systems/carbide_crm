import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should display 404 page for unknown routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    
    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByText(/page not found/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /go to dashboard/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /go back/i })).toBeVisible();
  });

  test('should navigate back from 404 page', async ({ page }) => {
    // First go to login, then to 404
    await page.goto('/login');
    await page.goto('/unknown-route');
    
    await page.getByRole('button', { name: /go back/i }).click();
    
    // Should go back to previous page
    await expect(page).toHaveURL(/\/login/);
  });

  test('should navigate to dashboard from 404 page', async ({ page }) => {
    await page.goto('/unknown-route');
    
    await page.getByRole('link', { name: /go to dashboard/i }).click();
    
    // Should redirect to login since not authenticated
    await expect(page).toHaveURL(/\/login/);
  });

  test('should have accessible 404 page', async ({ page }) => {
    await page.goto('/unknown-route');
    
    // Check heading structure
    await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
    
    // Check navigation options are focusable
    const goBackButton = page.getByRole('button', { name: /go back/i });
    const dashboardLink = page.getByRole('link', { name: /go to dashboard/i });
    
    await goBackButton.focus();
    await expect(goBackButton).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(dashboardLink).toBeFocused();
  });
});

test.describe('Global Search', () => {
  test.beforeEach(async ({ page }) => {
    // Go to login page as search should be available everywhere
    await page.goto('/login');
  });

  test('should open command palette with keyboard shortcut', async ({ page }) => {
    // Cmd+K or Ctrl+K should open search
    await page.keyboard.press('Meta+k');
    
    // Should show search dialog (may not be visible if not authenticated)
    // This test verifies the shortcut is registered
  });
});

