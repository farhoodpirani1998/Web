import { useEffect } from "react";

import { useSiteSettings } from "./useSiteSettings";

/** Keeps the document favicon in sync with the CMS-selected media asset. */
export function SiteSettingsHead() {
  const { data } = useSiteSettings();
  const faviconUrl = data?.favicon?.url;

  useEffect(() => {
    if (!faviconUrl) return;

    let icon = document.head.querySelector<HTMLLinkElement>('link[rel="icon"]');
    const created = !icon;
    if (!icon) {
      icon = document.createElement("link");
      icon.rel = "icon";
      document.head.appendChild(icon);
    }

    const previousHref = icon.getAttribute("href");
    const previousType = icon.getAttribute("type");
    icon.href = faviconUrl;
    icon.removeAttribute("type");

    return () => {
      if (created) {
        icon?.remove();
      } else if (icon) {
        if (previousHref === null) icon.removeAttribute("href");
        else icon.setAttribute("href", previousHref);
        if (previousType === null) icon.removeAttribute("type");
        else icon.setAttribute("type", previousType);
      }
    };
  }, [faviconUrl]);

  return null;
}
