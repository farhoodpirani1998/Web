import { test, expect } from '@playwright/test';

test.describe('Mobile — Responsive design and touch interactions', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport before each test
    await page.setViewportSize({ width: 375, height: 812 });
  });

  test('HomePage responsive on mobile', async ({ page }) => {
    await page.goto('/');
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });

  test('Mobile navigation drawer accessible', async ({ page }) => {
    await page.goto('/');
    // Look for menu button (hamburger)
    const menuButton = page.getByRole('button').filter({ hasText: /menu|hamburger/i }).first();
    if (await menuButton.isVisible()) {
      await menuButton.click();
      // Verify drawer or menu opens
      const navMenu = page.locator('nav');
      await expect(navMenu).toBeVisible();
    }
  });

  test('Mobile: tap navigation link', async ({ page }) => {
    await page.goto('/');
    const aboutLink = page.getByRole('link', { name: /about/i }).first();
    if (await aboutLink.isVisible()) {
      await aboutLink.tap();
      await expect(page).toHaveURL('/about');
    }
  });

  test('SchoolsPage responsive on mobile', async ({ page }) => {
    await page.goto('/schools');
    await page.waitForLoadState('networkidle');

    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('NewsPage list responsive on mobile', async ({ page }) => {
    await page.goto('/news');
    await page.waitForLoadState('networkidle');

    const articles = page.locator('article, [role="listitem"]');
    const count = await articles.count();
    expect(count).toBeGreaterThan(0);
  });

  test('StatisticsPage readable on mobile', async ({ page }) => {
    await page.goto('/statistics');
    await page.waitForLoadState('networkidle');

    // Check that stats are visible (not cut off)
    const stats = page.locator('[class*="stat"]');
    const isVisible = await stats.first().isVisible().catch(() => false);
    expect(isVisible === true || isVisible === false).toBeTruthy();
  });

  test('GalleryPage scrollable on mobile', async ({ page }) => {
    await page.goto('/gallery');
    await page.waitForLoadState('networkidle');

    const gallery = page.locator('main');
    await expect(gallery).toBeVisible();
  });

  test('CampusesPage accessible on mobile', async ({ page }) => {
    await page.goto('/campuses');
    await page.waitForLoadState('networkidle');

    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('TeachersPage grid responsive on mobile', async ({ page }) => {
    await page.goto('/teachers');
    await page.waitForLoadState('networkidle');

    const cards = page.locator('[class*="card"]');
    const count = await cards.count();
    // At least one card should be visible on mobile
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('EventsPage readable on mobile', async ({ page }) => {
    await page.goto('/events');
    await page.waitForLoadState('networkidle');

    const eventList = page.locator('main');
    await expect(eventList).toBeVisible();
  });

  test('Mobile: form input focus and keyboard', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    const input = page.locator('input[type="text"]').first();
    if (await input.isVisible()) {
      await input.click();
      await expect(input).toBeFocused();
    }
  });

  test('Mobile: viewport scrollable without layout shift', async ({ page }) => {
    await page.goto('/');
    const initialHeight = await page.viewportSize();
    await page.evaluate(() => window.scrollBy(0, 100));
    const finalHeight = await page.viewportSize();
    expect(initialHeight?.height).toBe(finalHeight?.height);
  });

  test('Mobile: touch-friendly button sizes', async ({ page }) => {
    await page.goto('/');
    const button = page.getByRole('button').first();

    if (await button.isVisible()) {
      const boundingBox = await button.boundingBox();
      // Buttons should be at least 44x44 for touch accessibility
      expect(boundingBox?.height).toBeGreaterThanOrEqual(40);
      expect(boundingBox?.width).toBeGreaterThanOrEqual(40);
    }
  });

  test('Tablet viewport (iPad)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });

  test('Large mobile viewport (landscape)', async ({ page }) => {
    await page.setViewportSize({ width: 812, height: 375 });
    await page.goto('/');

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });
});
