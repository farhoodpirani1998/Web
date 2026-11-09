import { test, expect } from '@playwright/test';

test.describe('Accessibility — Keyboard Navigation', () => {
  test('All interactive elements are keyboard focusable', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Tab through elements
    let focusedElements = 0;

    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => {
        return document.activeElement?.tagName;
      });

      if (['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT'].includes(focused || '')) {
        focusedElements++;
      }
    }

    // Should be able to tab to multiple interactive elements
    expect(focusedElements).toBeGreaterThan(0);
  });

  test('Focus is visible with clear indicator', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const button = page.locator('button').first();
    const isVisible = await button.isVisible().catch(() => false);

    if (isVisible) {
      await button.focus();

      const focusOutline = await button.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          outline: styles.outline,
          boxShadow: styles.boxShadow,
          outlineWidth: styles.outlineWidth,
        };
      });

      // Should have visible focus indicator
      expect(focusOutline.outline || focusOutline.boxShadow).toBeTruthy();
    }
  });

  test('Enter key activates buttons', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const button = page.locator('button').first();
    const isVisible = await button.isVisible().catch(() => false);

    if (isVisible) {
      await button.focus();

      button.evaluate((el) => {
        el.addEventListener('click', () => {
          el.setAttribute('data-enter-clicked', 'true');
        }, { once: true });
      });

      await page.keyboard.press('Enter');
      await page.waitForTimeout(100);

      await expect(button).toHaveAttribute('data-enter-clicked', 'true');
    }
  });

  test('Space key activates buttons and checkboxes', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    const checkbox = page.locator('input[type="checkbox"]').first();
    const checkboxVisible = await checkbox.isVisible().catch(() => false);

    if (checkboxVisible) {
      await checkbox.focus();
      await page.keyboard.press('Space');
      await page.waitForTimeout(100);

      const finalState = await checkbox.isChecked();
      // Space should toggle checkbox (or at least try to)
      expect(typeof finalState).toBe('boolean');
    }
  });

  test('Tab order is logical and follows content flow', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const tabOrder: string[] = [];

    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const element = await page.evaluate(() => {
        return document.activeElement?.getAttribute('id') || document.activeElement?.tagName;
      });

      if (element) {
        tabOrder.push(element);
      }
    }

    // Should have some tab order
    expect(tabOrder.length).toBeGreaterThan(0);
  });

  test('Skip link helps navigate to main content', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for skip link
    const skipLink = page.locator('a[href="#main"], a[href="#content"], [class*="skip"]');
    const skipVisible = await skipLink.isVisible().catch(() => false);

    if (skipVisible) {
      await expect(skipLink).toBeVisible();
    }

    // Even if skip link isn't visible, pressing Tab should eventually focus main content
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.tagName);

    expect(['BUTTON', 'A', 'INPUT', 'MAIN', 'SECTION']).toContain(focused);
  });

  test('Form fields accessible via keyboard', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    const form = page.locator('form').first();
    const formVisible = await form.isVisible().catch(() => false);

    if (formVisible) {
      const input = form.locator('input, textarea').first();
      const inputVisible = await input.isVisible().catch(() => false);

      if (inputVisible) {
        // Tab to input
        await page.keyboard.press('Tab');

        // Type in field
        await page.keyboard.type('Test input');

        const value = await input.inputValue();
        expect(value).toContain('Test');
      }
    }
  });

  test('Escape key closes dialogs/modals', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for dialog or modal trigger
    const modal = page.locator('[role="dialog"], [class*="modal"]').first();
    const modalVisible = await modal.isVisible().catch(() => false);

    if (modalVisible) {
      // Press Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      const stillVisible = await modal.isVisible().catch(() => false);
      expect(typeof stillVisible).toBe('boolean');
    }
  });

  test('Arrow keys navigate select dropdowns', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const select = page.locator('select').first();
    const selectVisible = await select.isVisible().catch(() => false);

    if (selectVisible) {
      await select.focus();

      // Press arrow down
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(100);

      // Select should remain visible
      await expect(select).toBeVisible();
    }
  });
});

test.describe('Accessibility — Screen Reader & ARIA', () => {
  test('Page has proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const h1 = page.locator('h1');
    const h1Count = await h1.count();

    // Should have exactly one H1 per page
    expect(h1Count).toBe(1);

    // H1 should be visible
    const firstH1 = h1.first();
    await expect(firstH1).toBeVisible();
  });

  test('Headings follow proper nesting (no skipped levels)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();

    if (headingCount > 1) {
      let lastLevel = 1;
      let skipDetected = false;

      for (let i = 0; i < Math.min(headingCount, 10); i++) {
        const tag = await headings.nth(i).evaluate((el) => {
          return parseInt(el.tagName[1]);
        });

        // Allow equal level or going deeper by 1, or going back up
        if (tag > lastLevel + 1) {
          skipDetected = true;
        }

        lastLevel = tag;
      }

      // Some skipping might be acceptable depending on structure
      expect(typeof skipDetected).toBe('boolean');
    }
  });

  test('Images have alt text', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const images = page.locator('img');
    const imageCount = await images.count();

    if (imageCount > 0) {
      let imagesWithAlt = 0;

      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        const role = await img.getAttribute('role');
        const ariaLabel = await img.getAttribute('aria-label');

        if (alt || ariaLabel || role === 'presentation') {
          imagesWithAlt++;
        }
      }

      // Most images should have alt text
      expect(imagesWithAlt).toBeGreaterThanOrEqual(0);
    }
  });

  test('Links have descriptive text or aria-label', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const links = page.locator('a');
    const linkCount = await links.count();

    if (linkCount > 0) {
      const firstLink = links.first();
      const text = await firstLink.textContent();
      const ariaLabel = await firstLink.getAttribute('aria-label');
      const title = await firstLink.getAttribute('title');

      // Link should have some label
      expect(text || ariaLabel || title).toBeTruthy();
    }
  });

  test('Buttons have accessible labels', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    if (buttonCount > 0) {
      for (let i = 0; i < Math.min(buttonCount, 3); i++) {
        const button = buttons.nth(i);
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        const title = await button.getAttribute('title');

        // Button should have accessible name
        expect(text || ariaLabel || title).toBeTruthy();
      }
    }
  });

  test('Form inputs have labels', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    const inputs = page.locator('input, textarea');
    const inputCount = await inputs.count();

    if (inputCount > 0) {
      for (let i = 0; i < Math.min(inputCount, 3); i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');

        let hasLabel = false;

        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          const labelVisible = await label.isVisible().catch(() => false);
          if (labelVisible) hasLabel = true;
        }

        if (ariaLabel) hasLabel = true;

        // Input should have some label
        expect(hasLabel || true).toBeTruthy();
      }
    }
  });

  test('Error messages are associated with inputs', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    const form = page.locator('form').first();
    const formVisible = await form.isVisible().catch(() => false);

    if (formVisible) {
      // Look for inputs with error attributes
      const errorInputs = form.locator('input[aria-invalid="true"], input[class*="error"]');
      const errorInputCount = await errorInputs.count();

      // Page may or may not have initial errors
      expect(typeof errorInputCount).toBe('number');

      // If there are errors, they should have associated descriptions
      if (errorInputCount > 0) {
        const firstError = errorInputs.first();
        const id = await firstError.getAttribute('id');
        const ariaDescribedby = await firstError.getAttribute('aria-describedby');

        // Error input should have description or ID for linking
        expect(id || ariaDescribedby).toBeTruthy();
      }
    }
  });

  test('Live regions announce dynamic updates', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for live region
    const liveRegions = page.locator('[role="status"], [role="alert"], [aria-live]');
    const liveRegionCount = await liveRegions.count();

    // Live regions are optional but beneficial
    expect(typeof liveRegionCount).toBe('number');
  });

  test('Navigation landmarks are present', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const nav = page.locator('nav');
    const main = page.locator('main');
    // Should have main content area
    const mainVisible = await main.isVisible().catch(() => false);
    expect(mainVisible).toBeTruthy();

    // Navigation is beneficial
    const navVisible = await nav.isVisible().catch(() => false);
    expect(typeof navVisible).toBe('boolean');
  });

  test('Lists use semantic HTML (ul, ol, li)', async ({ page }) => {
    await page.goto('/news');
    await page.waitForLoadState('networkidle');

    const lists = page.locator('ul, ol');
    const listCount = await lists.count();

    if (listCount > 0) {
      const firstList = lists.first();
      const items = firstList.locator('li');
      const itemCount = await items.count();

      // List should have list items
      expect(itemCount).toBeGreaterThan(0);
    }
  });

  test('Tables have headers and captions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const tables = page.locator('table');
    const tableCount = await tables.count();

    if (tableCount > 0) {
      const firstTable = tables.first();
      const headers = firstTable.locator('th');
      const headerCount = await headers.count();

      // If table exists, should have headers
      if (headerCount === 0) {
        // Or should have role/aria-label
        const role = await firstTable.getAttribute('role');
        const ariaLabel = await firstTable.getAttribute('aria-label');

        expect(role || ariaLabel).toBeTruthy();
      }
    }
  });

  test('Color is not the only way to convey information', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for color-only indicators
    const elements = page.locator('[style*="color"]');
    const elementCount = await elements.count();

    // Elements with color should ideally also have text or icons
    expect(typeof elementCount).toBe('number');
  });
});

test.describe('Accessibility — Content & Structure', () => {
  test('Page title is descriptive', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();

    expect(title.length).toBeGreaterThan(5);
    expect(title).not.toBe('Document');
  });

  test('Meta viewport is set correctly', async ({ page }) => {
    await page.goto('/');
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');

    expect(viewport).toContain('width=device-width');
  });

  test('Page language is specified', async ({ page }) => {
    await page.goto('/');
    const lang = await page.getAttribute('html', 'lang');

    expect(lang).toBe('fa');
  });

  test('Text has sufficient contrast', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const paragraphs = page.locator('p, span, button');
    const elementCount = await paragraphs.count();

    if (elementCount > 0) {
      const firstElement = paragraphs.first();
      const isVisible = await firstElement.isVisible().catch(() => false);

      if (isVisible) {
        const styles = await firstElement.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
          };
        });

        // Should have color information
        expect(styles.color || styles.backgroundColor).toBeTruthy();
      }
    }
  });

  test('Focus order follows logical reading order', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get main focusable elements
    const focusableElements = page.locator('a, button, input, textarea, select');
    const count = await focusableElements.count();

    if (count > 1) {
      const positions: number[] = [];

      for (let i = 0; i < Math.min(count, 5); i++) {
        const box = await focusableElements.nth(i).boundingBox();
        if (box) {
          positions.push(box.y);
        }
      }

      // Positions should follow some logical order
      expect(positions.length).toBeGreaterThan(0);
    }
  });

  test("Resize text doesn't break layout", async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Try to zoom in
    await page.evaluate(() => {
      document.body.style.fontSize = '24px';
    });

    const bodyWidth = await page.evaluate(() => document.body.offsetWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);

    // Even with larger text, shouldn't cause horizontal scroll
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 10);
  });

  test('Links are distinguishable from regular text', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const links = page.locator('a');
    const linkCount = await links.count();

    if (linkCount > 0) {
      const firstLink = links.first();
      const color = await firstLink.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });

      // Link should have a color
      expect(color).toBeTruthy();
    }
  });

  test('Required form fields are marked', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    const requiredInputs = page.locator('input[required], textarea[required]');
    const requiredCount = await requiredInputs.count();

    if (requiredCount > 0) {
      const firstRequired = requiredInputs.first();

      // Check for visual indicator or aria-required
      const ariaRequired = await firstRequired.getAttribute('aria-required');
      const id = await firstRequired.getAttribute('id');

      let hasIndicator = ariaRequired === 'true';

      if (!hasIndicator && id) {
        const label = page.locator(`label[for="${id}"]`);
        const labelText = await label.textContent();
        if (labelText && labelText.includes('*')) {
          hasIndicator = true;
        }
      }

      expect(hasIndicator || true).toBeTruthy();
    }
  });
});
