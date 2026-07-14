import {
  AspectRatio,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Link,
  Stack,
  Text,
} from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";
import type { Campus } from "./types";

export interface CampusCardProps {
  campus: Campus;
}

/**
 * Single-campus summary card — the unit `CampusList` repeats.
 *
 * Presentation only: takes a fully-formed `Campus` object as a prop
 * and renders it; no data fetching, no business logic, no internal
 * state. Extracted as its own component (rather than inlined in
 * `CampusList`'s `.map`) so it can also be reused elsewhere later
 * (e.g. a homepage "featured campuses" section) without duplicating
 * this markup.
 *
 * No real photo assets exist yet (Campuses/Media content-module data,
 * §4, §8, no Public API endpoint today), so the image slot still
 * renders a labelled placeholder surface rather than wiring the
 * `Image` component against a URL that doesn't exist. Visual refresh:
 * the placeholder is now a wider (16:9) soft navy/gold gradient tile
 * with a decorative building glyph — the same "crest/emblem instead of
 * a flat grey box" treatment `GalleryCard` already established — with
 * the area badge floating over it as a frosted chip, the card lifting
 * on hover (`elevated` + hover-shadow, matching `GalleryCard`/
 * `NewsCard`), and the address/phone rows picking up small inline
 * glyphs so the contact block reads as data rather than plain text.
 * Once `campus.image.src` is populated by real data, swapping the
 * placeholder block below for `<Image src={campus.image.src} ... />`
 * is a change contained entirely to this file.
 */
export function CampusCard({ campus }: CampusCardProps) {
  return (
    <Card
      variant="elevated"
      padding="none"
      className="group overflow-hidden bg-background transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <AspectRatio
        ratio={16 / 9}
        className="bg-gradient-to-br from-brand-navy/10 via-muted to-brand-gold/15"
      >
        <Stack
          align="center"
          justify="center"
          gap="xs"
          className="absolute inset-0 h-full w-full px-2 text-center transition-transform duration-300 group-hover:scale-105"
        >
          <BuildingGlyph className="h-9 w-9 text-brand-navy/25" />
          <Text variant="caption" color="muted">
            تصویر نمونه
          </Text>
        </Stack>

        <Badge
          variant="secondary"
          className="absolute start-3 top-3 border-brand-gold/30 bg-background/85 text-brand-navy backdrop-blur-sm"
        >
          {campus.area}
        </Badge>
      </AspectRatio>

      <CardHeader className="gap-2 p-4 pb-0">
        <CardTitle className="font-heading">{campus.name}</CardTitle>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        <Stack gap="sm">
          <Text variant="bodySm" color="muted">
            {campus.description}
          </Text>

          <Stack direction="row" gap="xs" wrap>
            {campus.features.map((feature) => (
              <Badge key={feature} variant="outline">
                {feature}
              </Badge>
            ))}
          </Stack>

          <Stack gap="xs" className="border-t border-border pt-3">
            <Stack direction="row" gap="xs" align="start">
              <PinGlyph className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold" />
              <Text variant="bodySm" color="muted">
                {campus.address}
              </Text>
            </Stack>
            <Stack direction="row" gap="xs" align="center">
              <PhoneGlyph className="h-4 w-4 shrink-0 text-brand-gold" />
              <Link href={campus.contact.phoneHref} variant="subtle">
                {campus.contact.phone}
              </Link>
            </Stack>
          </Stack>

          <Link
            href={`#campus-${campus.id}`}
            variant="subtle"
            className="group/link inline-flex w-fit items-center gap-1 text-brand-navy"
          >
            جزئیات بیشتر
            <span
              aria-hidden="true"
              className="transition-transform duration-200 group-hover/link:-translate-x-0.5 rtl:group-hover/link:translate-x-0.5"
            >
              ‹
            </span>
          </Link>
        </Stack>
      </CardContent>
    </Card>
  );
}

/** Small decorative "building" glyph for the image placeholder tile. Purely presentational. */
function BuildingGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn(className)} aria-hidden="true" focusable="false">
      <rect x="4" y="3" width="11" height="18" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="15" y="9" width="5" height="12" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M7 7h1.5M11 7h1.5M7 10.5h1.5M11 10.5h1.5M7 14h1.5M11 14h1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M9.5 21v-3.5h1v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Small decorative "location pin" glyph for the address row. Purely presentational. */
function PinGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path
        d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.5" r="2.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** Small decorative "phone" glyph for the phone row. Purely presentational. */
function PhoneGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path
        d="M6.5 3.5h2.8l1.4 4.2-2 1.6a11 11 0 0 0 5.9 5.9l1.6-2 4.2 1.4v2.8a1.5 1.5 0 0 1-1.6 1.5A16 16 0 0 1 5 5.1a1.5 1.5 0 0 1 1.5-1.6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
