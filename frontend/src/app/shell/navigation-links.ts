import type { NavLinkItem } from "./DesktopNavigation";

const SCHEME_URL_PATTERN = /^[a-z][a-z\d+.-]*:/i;
const WEB_URL_PATTERN = /^(https?:)?\/\//i;

export function isExternalNavigationUrl(url: string): boolean {
  return SCHEME_URL_PATTERN.test(url) || url.startsWith("//");
}

export function getNavigationLinkTarget(
  url: string,
  target?: NavLinkItem["target"],
): NavLinkItem["target"] | undefined {
  return target ?? (WEB_URL_PATTERN.test(url) ? "_blank" : undefined);
}
