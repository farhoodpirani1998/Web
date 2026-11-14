import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useSeo } from "./useSeo";
import type { PublicSeoDto } from "./types";

const seo: PublicSeoDto = {
  title: "Test page",
  description: "Page description",
  canonicalUrl: "https://example.test/test-page",
  ogImageUrl: "https://example.test/image.jpg",
  robots: "index, follow",
};

describe("useSeo", () => {
  const originalTitle = document.title;

  afterEach(() => {
    document.title = originalTitle;
    document.head
      .querySelectorAll('meta[property^="og:"], meta[name^="twitter:"], link[rel="canonical"]')
      .forEach((element) => element.remove());
    document.head
      .querySelectorAll('meta[name="description"], meta[name="robots"]')
      .forEach((element) => element.remove());
  });

  it("applies canonical, Open Graph, and Twitter metadata", () => {
    renderHook(() => useSeo(seo));

    expect(document.title).toBe("Test page");
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      "content",
      "Page description",
    );
    expect(document.querySelector('meta[property="og:title"]')).toHaveAttribute(
      "content",
      "Test page",
    );
    expect(
      document.querySelector('meta[property="og:description"]'),
    ).toHaveAttribute("content", "Page description");
    expect(document.querySelector('meta[property="og:url"]')).toHaveAttribute(
      "content",
      "https://example.test/test-page",
    );
    expect(document.querySelector('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image",
    );
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://example.test/test-page",
    );
  });

  it("restores existing metadata when the page unmounts", () => {
    document.title = "Original title";
    const description = document.createElement("meta");
    description.name = "description";
    description.content = "Original description";
    document.head.appendChild(description);

    const { unmount } = renderHook(() => useSeo(seo));
    unmount();

    expect(document.title).toBe("Original title");
    expect(description).toHaveAttribute("content", "Original description");
    expect(document.querySelector('meta[property="og:title"]')).toBeNull();
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
  });
});
