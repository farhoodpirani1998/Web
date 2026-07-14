import {
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
import type { NewsItem } from "./types";

export interface NewsCardProps {
  item: NewsItem;
  /**
   * Renders the larger, horizontal "lead story" layout `NewsList` uses
   * for its first (most recent) item instead of the compact grid tile.
   * Optional and defaults to `false` — every existing caller that
   * doesn't pass it keeps rendering the original compact card shape.
   */
  featured?: boolean;
}

/**
 * Single-article summary card — the unit `NewsList` repeats,
 * mirroring `@/features/campuses`'s `CampusCard`,
 * `@/features/teachers`'s `TeacherCard`, and
 * `@/features/gallery`'s `GalleryCard`.
 *
 * Presentation only: takes a fully-formed `NewsItem` object as a prop
 * and renders it; no data fetching, no business logic, no internal
 * state. Extracted as its own component (rather than inlined in
 * `NewsList`'s `.map`, which is how this markup previously lived) so
 * it can also be reused elsewhere later (e.g. a homepage "latest
 * news" section) without duplicating this markup.
 *
 * There is deliberately no per-article route/link here previously
 * (§7 — no generic catch-all "render whatever this slug points to"
 * route); the "ادامه مطلب" link below points at `NewsDetails`'s
 * matching `#news-{id}` anchor on this same page — not a separate
 * per-article route — the same "card links to its own details panel"
 * convention as `CampusCard`'s "جزئیات بیشتر" link.
 *
 * Visual refresh: each card now carries a small navy/gold category
 * medallion (an `aria-hidden` glyph picked from `item.category`, the
 * same "decorative marker built from existing tokens" technique the
 * homepage `Features` cards use for their numbered badges) plus a
 * hover lift, for stronger visual hierarchy than the previous flat
 * text-only card. The optional `featured` prop lays the same content
 * out as a wider, horizontal "lead story" — used once by `NewsList`
 * for its first item — without changing `NewsItem`'s shape or adding
 * any data fetching.
 */
export function NewsCard({ item, featured = false }: NewsCardProps) {
  const { Icon, tone } = getCategoryVisual(item.category);

  return (
    <Card
      variant="elevated"
      padding="none"
      className={cn(
        "group overflow-hidden bg-background transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        featured && "sm:grid sm:grid-cols-[minmax(0,14rem)_1fr]",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-brand-navy/10 via-muted to-brand-gold/15 p-6",
          featured ? "sm:h-full" : "h-24",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "flex items-center justify-center rounded-full",
            tone,
            featured ? "h-16 w-16" : "h-11 w-11",
          )}
        >
          <Icon className={featured ? "h-7 w-7" : "h-5 w-5"} />
        </span>
      </div>

      <div>
        <CardHeader className={featured ? "p-6 pb-0 sm:p-8 sm:pb-0" : "p-4 pb-0"}>
          <Stack gap="xs">
            <Stack direction="row" gap="xs" align="center" wrap>
              <Badge variant="secondary">{item.category}</Badge>
              <Text variant="bodySm" color="muted">
                {item.date}
              </Text>
            </Stack>
            <CardTitle className={cn("font-heading", featured && "text-2xl")}>
              {item.title}
            </CardTitle>
          </Stack>
        </CardHeader>

        <CardContent className={featured ? "p-6 pt-3 sm:p-8 sm:pt-3" : "p-4 pt-2"}>
          <Stack gap="sm">
            <Text variant="bodySm" color="muted">
              {item.excerpt}
            </Text>
            <Link
              href={`#news-${item.id}`}
              variant="subtle"
              className="group/link inline-flex w-fit items-center gap-1 text-brand-navy"
            >
              ادامه مطلب
              <span
                aria-hidden="true"
                className="transition-transform duration-200 group-hover/link:-translate-x-0.5 rtl:group-hover/link:translate-x-0.5"
              >
                ‹
              </span>
            </Link>
          </Stack>
        </CardContent>
      </div>
    </Card>
  );
}

/**
 * Maps a `NewsItem.category` label to a decorative icon + navy/gold
 * tone for the card's medallion. Purely presentational — an unknown
 * category (or any future one) falls back to a neutral bell glyph
 * rather than throwing, so this never depends on the exact set of
 * category strings `./data` happens to use today.
 */
function getCategoryVisual(category: string): { Icon: typeof BellIcon; tone: string } {
  if (category.includes("رویداد")) {
    return { Icon: CalendarIcon, tone: "bg-brand-navy text-brand-gold" };
  }
  if (category.includes("دستاورد")) {
    return { Icon: TrophyIcon, tone: "bg-brand-gold/20 text-brand-navy" };
  }
  return { Icon: BellIcon, tone: "bg-brand-navy text-brand-gold" };
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <rect x="3.5" y="5" width="17" height="15" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path
        d="M7 4h10v4a5 5 0 0 1-10 0V4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M7 6H4.5a2 2 0 0 0 0 4H7M17 6h2.5a2 2 0 0 1 0 4H17" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 13v4M9 20h6M10 20v-3h4v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path
        d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M10 18.5a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
