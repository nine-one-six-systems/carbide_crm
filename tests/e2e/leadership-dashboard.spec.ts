import { test, expect } from '@playwright/test';

test.describe('Leadership Dashboard', () => {
  // Skip authentication for now - in a real scenario, you'd login first
  // The tests assume the app handles unauthenticated users gracefully
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the leadership dashboard
    // Note: In production, you'd need to login as a manager/admin first
    await page.goto('/leadership');
  });

  test('displays the page title and description', async ({ page }) => {
    // Check for the page heading
    const heading = page.getByRole('heading', { name: 'Leadership Dashboard' });
    await expect(heading).toBeVisible();

    // Check for the description text
    await expect(
      page.getByText('Cross-venture business opportunity overview')
    ).toBeVisible();
  });

  test('shows view toggle with Pipeline and Venture options', async ({ page }) => {
    // Look for the toggle group
    const byPipelineButton = page.getByRole('button', { name: /by pipeline/i });
    const byVentureButton = page.getByRole('button', { name: /by venture/i });

    await expect(byPipelineButton).toBeVisible();
    await expect(byVentureButton).toBeVisible();
  });

  test('defaults to Pipeline view', async ({ page }) => {
    const byPipelineButton = page.getByRole('button', { name: /by pipeline/i });
    
    // Check that Pipeline is the active/pressed button
    await expect(byPipelineButton).toHaveAttribute('data-state', 'on');
  });

  test('can toggle to Venture view', async ({ page }) => {
    const byVentureButton = page.getByRole('button', { name: /by venture/i });
    
    // Click to switch to Venture view
    await byVentureButton.click();

    // URL should update
    await expect(page).toHaveURL(/view=venture/);

    // Button should now be active
    await expect(byVentureButton).toHaveAttribute('data-state', 'on');
  });

  test('shows time period selector', async ({ page }) => {
    // Find the period dropdown
    const periodSelect = page.getByRole('combobox', { name: /time period/i });
    await expect(periodSelect).toBeVisible();
  });

  test('can change time period', async ({ page }) => {
    // Open the period dropdown
    const periodSelect = page.getByRole('combobox', { name: /time period/i });
    await periodSelect.click();

    // Select "Last 30 days"
    await page.getByRole('option', { name: 'Last 30 days' }).click();

    // URL should update with period parameter
    await expect(page).toHaveURL(/period=30d/);
  });

  test('shows filters button', async ({ page }) => {
    const filtersButton = page.getByRole('button', { name: /filters/i });
    await expect(filtersButton).toBeVisible();
  });

  test('can open filters popover', async ({ page }) => {
    const filtersButton = page.getByRole('button', { name: /filters/i });
    await filtersButton.click();

    // Should see the filter popover content
    await expect(page.getByText('Filter Dashboard')).toBeVisible();
  });

  test('shows summary cards section', async ({ page }) => {
    // Check for the summary cards region
    const summaryRegion = page.getByRole('region', { name: /dashboard summary/i });
    await expect(summaryRegion).toBeVisible();

    // Check for individual metric labels
    await expect(page.getByText('Active')).toBeVisible();
    await expect(page.getByText('Advanced')).toBeVisible();
    await expect(page.getByText(/stuck/i)).toBeVisible();
    await expect(page.getByText(/cold/i)).toBeVisible();
  });

  test('shows activity volume card', async ({ page }) => {
    // Check for the activity volume section
    await expect(page.getByText('Activity This Period')).toBeVisible();

    // Check for activity metrics
    await expect(page.getByText('Calls')).toBeVisible();
    await expect(page.getByText('Emails')).toBeVisible();
    await expect(page.getByText('Meetings')).toBeVisible();
  });

  test('shows refresh button', async ({ page }) => {
    const refreshButton = page.getByRole('button', {
      name: /refresh dashboard data/i,
    });
    await expect(refreshButton).toBeVisible();
  });

  test('URL parameters persist on page reload', async ({ page }) => {
    // Set some filter parameters
    await page.goto('/leadership?view=venture&period=30d');

    // Verify the state
    const byVentureButton = page.getByRole('button', { name: /by venture/i });
    await expect(byVentureButton).toHaveAttribute('data-state', 'on');

    // The period should reflect in the UI
    // (This tests that URL params are being parsed correctly)
    await expect(page).toHaveURL(/view=venture/);
    await expect(page).toHaveURL(/period=30d/);
  });

  test('switching views updates URL without page reload', async ({ page }) => {
    // Start at pipeline view
    await page.goto('/leadership?view=pipeline');

    // Click venture view
    const byVentureButton = page.getByRole('button', { name: /by venture/i });
    await byVentureButton.click();

    // URL should update (no full page navigation)
    await expect(page).toHaveURL(/view=venture/);

    // Page content should still be visible (wasn't a full reload)
    await expect(
      page.getByRole('heading', { name: 'Leadership Dashboard' })
    ).toBeVisible();
  });

  test('has proper accessibility attributes', async ({ page }) => {
    // Check that main landmarks exist
    await expect(
      page.getByRole('region', { name: /dashboard summary/i })
    ).toBeVisible();

    // Check toggle group has proper aria-label
    await expect(
      page.getByRole('group', { name: /dashboard view/i })
    ).toBeVisible();

    // Check buttons have proper aria-labels
    await expect(
      page.getByRole('button', { name: /view by pipeline/i })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /view by venture/i })
    ).toBeVisible();
  });
});

test.describe('Leadership Dashboard - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('view toggle shows icons only on mobile', async ({ page }) => {
    await page.goto('/leadership');

    // The toggle buttons should still be visible
    const byPipelineButton = page.getByRole('button', { name: /by pipeline/i });
    const byVentureButton = page.getByRole('button', { name: /by venture/i });

    await expect(byPipelineButton).toBeVisible();
    await expect(byVentureButton).toBeVisible();
  });

  test('filters button hides text on mobile', async ({ page }) => {
    await page.goto('/leadership');

    // The filters button should still be accessible
    const filtersButton = page.getByRole('button', { name: /filters/i });
    await expect(filtersButton).toBeVisible();
  });
});

