import { Badge, Card, Heading, Section, Stack, Text } from "@/shared/design-system/components";
import { newsItems } from "./data";
import { useNews } from "./useNews";

/**
 * News page "Details" section — the expanded, full-body view of each
 * article, distinct from `NewsList`'s compact excerpt cards. Mirrors
 * `@/features/campuses`'s `CampusDetails`,
 * `@/features/teachers`'s `TeacherDetails`, and
 * `@/features/gallery`'s `GalleryDetails`.
 *
 * This is the feature's "full article" functionality: rather than a
 * separate per-article route (deliberately out of scope, see
 * `NewsList`'s doc comment — §7, no generic catch-all slug route), it
 * reuses the same native `<details>`/`<summary>` disclosure pattern
 * already established by `CampusDetails`/`TeacherDetails`/
 * `GalleryDetails` — fully interactive, keyboard/screen-reader
 * accessible (§26), zero React/component state, and zero new
 * dependencies, in keeping with this project's existing conventions.
 * Each `<details>` carries the id `#news-{id}`, which is exactly what
 * `NewsCard`'s "ادامه مطلب" link points at — following that link both
 * scrolls to and (once the browser supports `:target`
 * auto-expansion, or once real interactivity is added later) reveals
 * the matching panel, no JS required for the scroll-to-anchor part.
 *
 * Backed by `useNews()` (the Public API's News content module, §4,
 * §8): renders `data.news` when the query has resolved with at least
 * one item, and falls back to the local `newsItems` placeholder array
 * (`./data`) — the same source `NewsList` falls back to — while the
 * query is loading, has errored, or the CMS has nothing published
 * yet.
 */
export function NewsDetails() {
  const { data } = useNews();
  const items = data && data.length > 0 ? data : newsItems;

  return (
    <Section spacing="lg" tone="muted" aria-labelledby="news-details-heading">
      <Stack gap="md">
        <Heading id="news-details-heading" level={2}>
          جزئیات اخبار
        </Heading>

        <Stack gap="sm">
          {items.map((item) => (
            <Card
              key={item.id}
              variant="outline"
              padding="none"
              className="transition-colors hover:border-brand-gold/40"
            >
              <details id={`news-${item.id}`} className="group px-6 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <Stack gap="xs">
                    <Text as="span" variant="body" weight="semibold" className="font-heading">
                      {item.title}
                    </Text>
                    <Stack direction="row" gap="xs" align="center">
                      <Badge variant="secondary">{item.category}</Badge>
                      <Text as="span" variant="caption" color="muted">
                        {item.date}
                      </Text>
                    </Stack>
                  </Stack>
                  <Text
                    as="span"
                    aria-hidden="true"
                    className="shrink-0 text-brand-gold transition-transform group-open:rotate-180"
                  >
                    ⌄
                  </Text>
                </summary>

                <Stack gap="sm" className="pt-3">
                  <Text variant="bodySm" color="muted">
                    {item.body}
                  </Text>
                </Stack>
              </details>
            </Card>
          ))}
        </Stack>
      </Stack>
    </Section>
  );
}
