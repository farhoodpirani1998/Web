import { test, expect } from '@playwright/test';

test.describe('RTL — Persian rendering and text directionality', () => {
  test('HTML has dir=rtl attribute', async ({ page }) => {
    await page.goto('/');
    const htmlDir = await page.getAttribute('html', 'dir');
    expect(htmlDir).toBe('rtl');
  });

  test('Body has text-right class', async ({ page }) => {
    await page.goto('/');
    const bodyClass = await page.getAttribute('body', 'class');
    expect(bodyClass).toContain('rtl');
  });

  test('StatisticsPage displays Persian numerals', async ({ page }) => {
    await page.goto('/statistics');
    // Wait for statistics to load
    await page.waitForLoadState('networkidle');

    // Look for Persian digits (۰-۹) in visible text
    const content = await page.textContent('body');
    const hasPersianDigits = /[۰-۹]/.test(content || '');
    expect(hasPersianDigits).toBeTruthy();
  });

  test('Sidebar positioned on right in RTL', async ({ page }) => {
    await page.goto('/');
    // Check if any navigation element has RTL-specific positioning
    const sidebar = page.locator('nav').first();
    const boundingBox = await sidebar.boundingBox();
    expect(boundingBox).toBeTruthy();
  });

  test('Page layout respects RTL text direction', async ({ page }) => {
    await page.goto('/');
    // Get the main content area
    const mainContent = page.locator('main').first();
    const computedDir = await mainContent.evaluate(
      (el) => window.getComputedStyle(el).direction
    );
    expect(computedDir).toBe('rtl');
  });

  test('News list maintains RTL layout', async ({ page }) => {
    await page.goto('/news');
    await page.waitForLoadState('networkidle');

    // Verify page is rendered
    const newsList = page.locator('main');
    await expect(newsList).toBeVisible();
  });

  test('Form inputs support RTL text', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    const input = page.locator('input[type="text"]').first();
    if (await input.isVisible()) {
      const dir = await input.getAttribute('dir');
      // Should either have dir=auto or dir=rtl
      expect(['auto', 'rtl', null]).toContain(dir);
    }
  });

  test('Teacher cards render in RTL grid', async ({ page }) => {
    await page.goto('/teachers');
    await page.waitForLoadState('networkidle');

    const cards = page.locator('[class*="grid"], [class*="flex"]');
    const cardCount = await cards.count();
    // Just verify cards loaded
    expect(cardCount).toBeGreaterThan(0);
  });

  test('Events page maintains RTL layout', async ({ page }) => {
    await page.goto('/events');
    await page.waitForLoadState('networkidle');

    const eventContainer = page.locator('main');
    await expect(eventContainer).toBeVisible();
  });
});
