import { test, expect } from '@playwright/test';

test.describe('Navigation — Main routes accessible', () => {
  test('HomePage loads and has h1', async ({ page }) => {
    await page.goto('/');
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });

  test('AboutPage accessible from nav', async ({ page }) => {
    await page.goto('/');
    const aboutLink = page.getByRole('link', { name: /about/i });
    await aboutLink.click();
    await expect(page).toHaveURL('/about');
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });

  test('SchoolsPage accessible', async ({ page }) => {
    await page.goto('/');
    const schoolsLink = page.getByRole('link', { name: /schools/i });
    await schoolsLink.click();
    await expect(page).toHaveURL('/schools');
  });

  test('NewsPage accessible', async ({ page }) => {
    await page.goto('/');
    const newsLink = page.getByRole('link', { name: /news/i });
    await newsLink.click();
    await expect(page).toHaveURL('/news');
  });

  test('GalleryPage accessible', async ({ page }) => {
    await page.goto('/');
    const galleryLink = page.getByRole('link', { name: /gallery/i });
    await galleryLink.click();
    await expect(page).toHaveURL('/gallery');
  });

  test('StatisticsPage accessible', async ({ page }) => {
    await page.goto('/');
    const statsLink = page.getByRole('link', { name: /statistics|آمار/i });
    await statsLink.click();
    await expect(page).toHaveURL('/statistics');
  });

  test('ContactPage accessible', async ({ page }) => {
    await page.goto('/');
    const contactLink = page.getByRole('link', { name: /contact/i });
    await contactLink.click();
    await expect(page).toHaveURL('/contact');
  });

  test('CampusesPage accessible', async ({ page }) => {
    await page.goto('/');
    const campusesLink = page.getByRole('link', { name: /campuses|موقعیت/i });
    await campusesLink.click();
    await expect(page).toHaveURL('/campuses');
  });

  test('TeachersPage accessible', async ({ page }) => {
    await page.goto('/');
    const teachersLink = page.getByRole('link', { name: /teachers|اساتید/i });
    await teachersLink.click();
    await expect(page).toHaveURL('/teachers');
  });

  test('EventsPage accessible', async ({ page }) => {
    await page.goto('/');
    const eventsLink = page.getByRole('link', { name: /events/i });
    await eventsLink.click();
    await expect(page).toHaveURL('/events');
  });

  test('AdmissionsPage accessible', async ({ page }) => {
    await page.goto('/');
    const admissionsLink = page.getByRole('link', { name: /admissions/i });
    await admissionsLink.click();
    await expect(page).toHaveURL('/admissions');
  });

  test('Back navigation works', async ({ page }) => {
    await page.goto('/');
    const aboutLink = page.getByRole('link', { name: /about/i });
    await aboutLink.click();
    await expect(page).toHaveURL('/about');
    await page.goBack();
    await expect(page).toHaveURL('/');
  });
});
