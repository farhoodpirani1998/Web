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
import type { NewsItem } from "./types";

export interface NewsCardProps {
  item: NewsItem;
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
 */
export function NewsCard({ item }: NewsCardProps) {
  return (
    <Card variant="outline" padding="md">
      <CardHeader className="p-0">
        <Stack gap="xs">
          <Stack direction="row" gap="xs" align="center">
            <Badge variant="secondary">{item.category}</Badge>
            <Text variant="bodySm" color="muted">
              {item.date}
            </Text>
          </Stack>
          <CardTitle>{item.title}</CardTitle>
        </Stack>
      </CardHeader>
      <CardContent className="p-0 pt-2">
        <Stack gap="sm">
          <Text variant="bodySm" color="muted">
            {item.excerpt}
          </Text>
          <Link href={`#news-${item.id}`} variant="subtle">
            ادامه مطلب
          </Link>
        </Stack>
      </CardContent>
    </Card>
  );
}
