import { expect, test } from "@playwright/test";

const publicRoutePatterns = [
  /^\/$/,
  /^\/about\/?$/,
  /^\/schools\/?$/,
  /^\/schools\/[^/]+\/?$/,
  /^\/library\/?$/,
  /^\/library\/[^/]+\/?$/,
  /^\/news\/?$/,
  /^\/news\/[^/]+\/?$/,
  /^\/gallery\/?$/,
  /^\/statistics\/?$/,
  /^\/contact\/?$/,
  /^\/site\/?$/,
  /^\/pre-registration\/?$/,
  /^\/campuses\/?$/,
  /^\/campuses\/[^/]+\/?$/,
  /^\/teachers\/?$/,
  /^\/teachers\/[^/]+\/?$/,
  /^\/events\/?$/,
  /^\/events\/[^/]+\/?$/,
  /^\/admissions\/?$/,
  /^\/academic-calendar\/?$/,
  /^\/pages\/[^/]+\/?$/,
];

test("internal links on the homepage match a registered public route", async ({
  page,
}) => {
  await page.goto("/");

  const links = await page.locator("a[href]").evaluateAll((anchors) =>
    anchors
      .map((anchor) => (anchor as HTMLAnchorElement).href)
      .filter((href) => new URL(href).origin === window.location.origin),
  );
  const invalidLinks = links.filter((href) => {
    const { pathname } = new URL(href);
    return !publicRoutePatterns.some((pattern) => pattern.test(pathname));
  });

  expect(invalidLinks, "Internal links must target a registered public route").toEqual([]);
});
