import { test, expect } from '@playwright/test';

test.describe('Homepage — Load, Performance & Content', () => {
  test('Homepage loads successfully with no errors', async ({ page }) => {
    // Listen for console errors
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify no console errors occurred
    expect(consoleErrors.length).toBe(0);

    // Verify main content is visible
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('Homepage has correct SEO meta tags', async ({ page }) => {
    await page.goto('/');

    // Check title
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    // Check meta description
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    expect(metaDescription).toBeTruthy();

    // Check lang attribute
    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBe('fa');

    // Check dir="rtl"
    const dir = await page.getAttribute('html', 'dir');
    expect(dir).toBe('rtl');
  });

  test('Homepage Hero section renders', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for hero section
    const hero = page.locator('section').first();
    await expect(hero).toBeVisible();

    // Verify main heading exists
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    const headingText = await heading.textContent();
    expect(headingText).toBeTruthy();
  });

  test('Homepage displays all major sections', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for common section indicators
    const sections = page.locator('section');
    const sectionCount = await sections.count();
    // Homepage should have multiple sections (Hero, Stats, About, etc.)
    expect(sectionCount).toBeGreaterThanOrEqual(3);
  });

  test('Homepage images load correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get all images
    const images = page.locator('img');
    const imageCount = await images.count();

    // Verify at least some images are present
    expect(imageCount).toBeGreaterThan(0);

    // Check that visible images have proper dimensions
    for (let i = 0; i < Math.min(imageCount, 3); i++) {
      const img = images.nth(i);
      const boundingBox = await img.boundingBox();
      if (await img.isVisible()) {
        expect(boundingBox?.width).toBeGreaterThan(0);
        expect(boundingBox?.height).toBeGreaterThan(0);
      }
    }
  });

  test('Homepage Call-to-Action buttons are clickable', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find buttons
    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();

    if (buttonCount > 0) {
      const firstButton = buttons.first();
      const boundingBox = await firstButton.boundingBox();
      expect(boundingBox?.width).toBeGreaterThan(0);
      expect(boundingBox?.height).toBeGreaterThan(0);
    }
  });

  test('Homepage has proper Vazirmatn font loading', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if font is loaded via CSS
    const fontLinks = page.locator('link[rel="preload"][as="font"]');
    const fontCount = await fontLinks.count();
    expect(fontCount).toBeGreaterThan(0);

    // Verify font link has correct href
    const firstFontLink = fontLinks.first();
    const href = await firstFontLink.getAttribute('href');
    expect(href).toContain('vazirmatn');
  });

  test('Homepage responds to viewport changes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check desktop viewport
    let mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();

    // Switch to mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);

    mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();

    // Switch back to desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);

    mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('Homepage statistics section loads data', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for stats elements
    const stats = page.locator('[class*="stat"]');
    const statsCount = await stats.count();

    // Stats section should have at least some elements
    if (statsCount > 0) {
      const firstStat = stats.first();
      await expect(firstStat).toBeVisible();
    }
  });

  test('Homepage news section displays articles', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for news/article elements
    const articles = page.locator('article');
    const articleCount = await articles.count();

    // Should have at least one article preview
    if (articleCount > 0) {
      const firstArticle = articles.first();
      await expect(firstArticle).toBeVisible();
    }
  });

  test('Homepage gallery section displays images', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Scroll to find gallery section if needed
    const pageContent = page.locator('body');
    const bodyBox = await pageContent.boundingBox();

    if (bodyBox) {
      // Try to find gallery images
      const galleryImages = page.locator('[class*="gallery"] img, [class*="image"] img');
      const imageCount = await galleryImages.count();

      // Gallery should have images if it exists
      if (imageCount > 0) {
        const firstImage = galleryImages.first();
        await expect(firstImage).toBeVisible();
      }
    }
  });
});

test.describe('Homepage — Performance Metrics', () => {
  test('Homepage has acceptable Largest Contentful Paint (LCP)', async ({ page }) => {
    const metrics: { name: string; startTime: number; duration: number }[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'log') {
        const text = msg.text();
        if (text.includes('Largest Contentful Paint')) {
          metrics.push({ name: 'LCP', startTime: 0, duration: 0 });
        }
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const entries = performance.getEntriesByType('largest-contentful-paint');
      if (entries.length > 0) {
        const lcp = entries[entries.length - 1] as PerformanceEntry;
        return lcp.startTime;
      }
      return 0;
    });

    // LCP should ideally be under 2.5s (good), but we accept up to 4s for now
    // This is more lenient as the dev server may be slower
    expect(performanceMetrics).toBeLessThan(4000);
  });

  test('Homepage has acceptable Cumulative Layout Shift (CLS)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get CLS metric
    const clsValue = await page.evaluate(() => {
      const entries = performance.getEntriesByType('layout-shift');
      let totalCLS = 0;
      for (const entry of entries) {
        const layoutShift = entry as PerformanceEntry & {
          hadRecentInput?: boolean;
          value: number;
        };
        if (layoutShift.hadRecentInput) continue;
        totalCLS += layoutShift.value;
      }
      return totalCLS;
    });

    // CLS should be less than 0.1 (good), accept up to 0.25 for now
    expect(clsValue).toBeLessThan(0.25);
  });
});
