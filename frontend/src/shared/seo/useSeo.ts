import { useEffect } from "react";

import type { PublicSeoDto, StructuredDataItem } from "./types";

/**
 * Applies a page's backend-resolved `PublicSeoDto` (§21) to the
 * document head: `document.title`, the `description`/`robots` meta
 * tags, the `og:image` meta tag, the canonical `<link>`, and one
 * `<script type="application/ld+json">` per `structuredData` entry.
 *
 * No react-helmet or similar dependency (Phase 1 has none installed,
 * and this codebase has no existing head-management library — see
 * `index.html`'s placeholder-title comment) — tags are written/removed
 * directly via the DOM, same "no new dependency" approach the rest of
 * `@/shared` follows.
 *
 * Every tag this hook touches (including the `index.html` placeholder
 * `<meta name="description">`) has its previous state captured before
 * being written to, so cleanup restores exactly what was there before
 * — removing tags this hook created, and reverting tags it only edited
 * — rather than assuming it's the sole owner of the document head.
 */
export function useSeo(
  seo: PublicSeoDto | undefined,
  structuredData?: readonly StructuredDataItem[],
): void {
  useEffect(() => {
    if (!seo) return;

    const previousTitle = document.title;
    document.title = seo.title;

    const restoreFns: Array<() => void> = [];

    const upsertAttr = (el: HTMLElement, attr: string, value: string) => {
      const hadAttr = el.hasAttribute(attr);
      const previousValue = el.getAttribute(attr);
      el.setAttribute(attr, value);
      restoreFns.push(() => {
        if (hadAttr) el.setAttribute(attr, previousValue as string);
        else el.removeAttribute(attr);
      });
    };

    const upsertMeta = (attr: "name" | "property", key: string, content: string | undefined) => {
      if (!content) return;
      let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
        restoreFns.push(() => el?.remove());
      }
      upsertAttr(el, "content", content);
    };

    upsertMeta("name", "description", seo.description);
    upsertMeta("name", "robots", seo.robots);
    upsertMeta("property", "og:image", seo.ogImageUrl);

    let canonicalEl = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement("link");
      canonicalEl.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalEl);
      restoreFns.push(() => canonicalEl?.remove());
    }
    upsertAttr(canonicalEl, "href", seo.canonicalUrl);

    for (const item of structuredData ?? []) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(item);
      document.head.appendChild(script);
      restoreFns.push(() => script.remove());
    }

    return () => {
      document.title = previousTitle;
      for (const restore of restoreFns.reverse()) restore();
    };
  }, [seo, structuredData]);
}
