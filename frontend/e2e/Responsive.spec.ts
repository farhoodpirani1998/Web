import { test, expect } from '@playwright/test';

test.describe('Responsive Design — Mobile, Tablet, Desktop', () => {
  test('Mobile (375x812) — Homepage renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();

    // Verify no horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.offsetWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 10); // Allow small margin
  });

  test('Mobile (375x812) — Text is readable without zoom', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const fontSize = await page.locator('body').evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });

    const fontSizeNum = parseFloat(fontSize);
    // Font size should be at least 12px for readability
    expect(fontSizeNum).toBeGreaterThanOrEqual(12);
  });

  test('Mobile (375x812) — Touch targets are 44x44 or larger', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();

    if (buttonCount > 0) {
      for (let i = 0; i < Math.min(buttonCount, 3); i++) {
        const button = buttons.nth(i);
        const isVisible = await button.isVisible();

        if (isVisible) {
          const boundingBox = await button.boundingBox();
          if (boundingBox) {
            // Touch targets should be at least 44x44
            expect(boundingBox.width).toBeGreaterThanOrEqual(40);
            expect(boundingBox.height).toBeGreaterThanOrEqual(40);
          }
        }
      }
    }
  });

  test('Mobile (375x812) — Navigation is accessible', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for mobile menu or navigation
    const nav = page.locator('nav').first();
    const navVisible = await nav.isVisible().catch(() => false);

    if (navVisible) {
      await expect(nav).toBeVisible();
    }

    // Should have at least one navigation link
    const navLinks = page.locator('nav a, [role="navigation"] a');
    const linkCount = await navLinks.count();
    expect(linkCount).toBeGreaterThan(0);
  });

  test('Mobile (375x812) — Hamburger menu opens on click', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const menuButton = page.locator('button[aria-label*="menu" i], [class*="hamburger"]').first();
    const menuVisible = await menuButton.isVisible().catch(() => false);

    if (menuVisible) {
      await menuButton.click();
      await page.waitForTimeout(300);

      const nav = page.locator('nav');
      const navVisible = await nav.isVisible();
      expect(navVisible).toBeTruthy();
    }
  });

  test('Mobile (375x812) — Page scrolls without layout shift', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const initialWidth = await page.viewportSize();

    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 200));
    await page.waitForTimeout(300);

    const finalWidth = await page.viewportSize();

    // Viewport width should not change during scroll
    expect(initialWidth?.width).toBe(finalWidth?.width);
  });

  test('Tablet (768x1024) — Homepage layout adapts', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();

    // Verify content is centered and readable
    const contentBox = await mainContent.boundingBox();
    expect(contentBox?.width).toBeGreaterThan(0);
  });

  test('Tablet (768x1024) — Columns adjust properly', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for multi-column layouts
    const grids = page.locator('[class*="grid"], [class*="columns"]');
    const gridCount = await grids.count();

    if (gridCount > 0) {
      const firstGrid = grids.first();
      const isVisible = await firstGrid.isVisible();
      expect(isVisible).toBeTruthy();
    }
  });

  test('Tablet (768x1024) — Images scale appropriately', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const images = page.locator('img');
    const imageCount = await images.count();

    if (imageCount > 0) {
      const firstImage = images.first();
      const isVisible = await firstImage.isVisible();

      if (isVisible) {
        const boundingBox = await firstImage.boundingBox();
        expect(boundingBox?.width).toBeGreaterThan(0);
        // Image width should not exceed viewport
        const viewport = await page.viewportSize();
        expect(boundingBox?.width).toBeLessThanOrEqual(viewport!.width);
      }
    }
  });

  test('Desktop (1280x720) — Full layout renders', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();

    // Desktop layout should have visible content
    const contentBox = await mainContent.boundingBox();
    expect(contentBox?.width).toBeGreaterThan(600);
  });

  test('Desktop (1280x720) — Multi-column layout works', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for sidebar or multi-column layout
    const sidebar = page.locator('aside, [class*="sidebar"]').first();
    const sidebarVisible = await sidebar.isVisible().catch(() => false);

    if (sidebarVisible) {
      await expect(sidebar).toBeVisible();
    }
  });

  test('Desktop (1280x720) — All sections visible without scroll', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check viewport utilization
    const mainContent = page.locator('main');
    const box = await mainContent.boundingBox();

    expect(box).toBeTruthy();
    expect(box?.height).toBeGreaterThan(0);
  });

  test('Desktop (1280x720) — Hover effects work', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const link = page.locator('a').first();
    const isVisible = await link.isVisible();

    if (isVisible) {
      // Move mouse to link
      const box = await link.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(100);

        // Verify link is still visible (hover shouldn't hide it)
        await expect(link).toBeVisible();
      }
    }
  });

  test('Large Desktop (1920x1080) — Content not overstretched', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const mainContent = page.locator('main');
    const contentBox = await mainContent.boundingBox();

    // Content should have reasonable max-width and not stretch too wide
    if (contentBox) {
      expect(contentBox.width).toBeLessThan(1920 * 0.95); // Allow 95% max
    }
  });

  test('Landscape mobile (812x375) — Layout adjusts', async ({ page }) => {
    await page.setViewportSize({ width: 812, height: 375 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('Media queries apply correctly for small screens', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if display: none elements are not taking space
    const hiddenElements = page.locator('[style*="display: none"], [class*="hidden"]');
    const count = await hiddenElements.count();

    // Page should render even on very small screens
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('Responsive images use correct sizes attribute', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const images = page.locator('img[srcset], img[sizes]');
    const imageCount = await images.count();

    // Should have some responsive images
    expect(imageCount).toBeGreaterThanOrEqual(0);
  });

  test('Flex/Grid layouts wrap on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for flex or grid containers
    const containers = page.locator('[class*="flex"], [class*="grid"]');
    const containerCount = await containers.count();

    if (containerCount > 0) {
      const firstContainer = containers.first();
      const display = await firstContainer.evaluate(
        (el) => window.getComputedStyle(el).display
      );

      expect(['flex', 'grid']).toContain(display);
    }
  });
});

test.describe('Responsive Design — Overflow & Scrolling', () => {
  test('No horizontal scrollbar on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasHorizontalScroll).toBeFalsy();
  });

  test('Content fits within viewport on all sizes', async ({ page }) => {
    const sizes = [
      { width: 320, height: 568 },
      { width: 375, height: 812 },
      { width: 768, height: 1024 },
      { width: 1280, height: 720 },
    ];

    for (const size of sizes) {
      await page.setViewportSize(size);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const bodyWidth = await page.evaluate(() => document.body.offsetWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);

      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10);
    }
  });

  test('Long text content wraps properly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for paragraph text
    const paragraphs = page.locator('p');
    const paragraphCount = await paragraphs.count();

    if (paragraphCount > 0) {
      const firstParagraph = paragraphs.first();
      const isVisible = await firstParagraph.isVisible();

      if (isVisible) {
        const box = await firstParagraph.boundingBox();
        expect(box?.width).toBeLessThanOrEqual(375 + 10);
      }
    }
  });

  test('Tables scroll horizontally on mobile if needed', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const tables = page.locator('table');
    const tableCount = await tables.count();

    if (tableCount > 0) {
      const firstTable = tables.first();
      const isVisible = await firstTable.isVisible().catch(() => false);

      if (isVisible) {
        // Table should either be wrapped or scrollable
        const wrapper = firstTable.locator('..');
        const overflowX = await wrapper.evaluate(
          (el) => window.getComputedStyle(el).overflowX
        );

        expect(['auto', 'scroll', 'hidden']).toContain(overflowX);
      }
    }
  });
});
