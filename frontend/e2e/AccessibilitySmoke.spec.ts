import { expect, test, type Page } from "@playwright/test";

// Keep this smoke suite independent of the backend and external script hosts.
test.beforeEach(async ({ page }) => {
  await page.route("**/public/**", (route) =>
    route.fulfill({ status: 503, contentType: "application/json", body: "{}" }),
  );
  await page.route("https://cdn.aidesigner.ai/**", (route) => route.abort());
});

async function openHome(page: Page, width = 1280) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto("/");
  await expect(page.locator("#main-content")).toBeVisible();
}

test.use({ video: "off" });

test.describe("Accessibility smoke checks (API-independent)", () => {
  test("document exposes Persian RTL and a single main landmark", async ({ page }) => {
    await openHome(page);

    await expect(page.locator("html")).toHaveAttribute("lang", "fa");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("main")).toHaveCount(1);
    await expect(page.locator("#main-content")).toHaveCSS("direction", "rtl");
  });

  test("keyboard users can reveal the skip link and focus main content", async ({
    page,
  }) => {
    await openHome(page);

    const skipLink = page.getByRole("link", { name: "Skip to main content" });
    await page.keyboard.press("Tab");
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main-content$/);
    await expect(page.locator("#main-content")).toBeFocused();
  });

  test("mobile navigation opens and Escape restores focus in RTL layout", async ({
    page,
  }) => {
    await openHome(page, 375);

    const menuButton = page.locator('button[aria-controls="mobile-nav-panel"]');
    await menuButton.focus();
    await page.keyboard.press("Enter");

    const navigation = page.getByRole("navigation", { name: "ناوبری اصلی" });
    await expect(menuButton).toHaveAttribute("aria-expanded", "true");
    await expect(navigation).toBeVisible();

    const bounds = await navigation.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeLessThan(375 / 2);
    expect(bounds!.width).toBeLessThanOrEqual(375 * 0.85);

    await navigation.locator("a").first().focus();
    await page.keyboard.press("Escape");
    await expect(navigation).toBeHidden();
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
    await expect(menuButton).toBeFocused();
  });

  test("homepage has no horizontal overflow at a narrow mobile width", async ({
    page,
  }) => {
    await openHome(page, 320);

    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
  });
});
