import { apiClient } from "@/shared/api";

import type { Hero, PublicHeroSlideDto } from "./types";

/**
 * Request functions for the `hero` feature's Public API endpoint.
 *
 * Per §14/§30, this is the only file in the `hero` feature aware of the
 * endpoint's URL — `useHero` and any future consumer call `fetchHero`,
 * never `apiClient` directly.
 *
 * The real endpoint (`GET /public/hero`) returns every published slide
 * (a carousel, ordered by `position`), not the single-slide shape
 * `./Hero.tsx` renders — `toHero` below adapts the first *usable*
 * slide (published, per the controller, and carrying a background
 * image `Hero.tsx`'s full-bleed layout requires) into that shape.
 * `Hero.tsx` already falls back to its own placeholder copy whenever
 * this rejects (no slides at all, or no slide has a usable image), so
 * throwing here is enough — no separate empty-state value needed.
 */
export async function fetchHero(): Promise<Hero> {
  const response = await apiClient.get<readonly PublicHeroSlideDto[]>("/hero");
  const slide = response.data.find((candidate) => candidate.backgroundImage !== null);

  if (!slide || !slide.backgroundImage) {
    throw new Error("No published hero slide with a background image");
  }

  return toHero(slide, slide.backgroundImage);
}

function toHero(
  slide: PublicHeroSlideDto,
  backgroundImage: NonNullable<PublicHeroSlideDto["backgroundImage"]>,
): Hero {
  return {
    title: slide.heading.fa,
    description: slide.subheading?.fa ?? "",
    image: {
      src: backgroundImage.url,
      alt: backgroundImage.altText,
    },
    primaryCta:
      slide.ctaLabel && slide.ctaUrl
        ? { label: slide.ctaLabel.fa, href: slide.ctaUrl }
        : undefined,
  };
}
