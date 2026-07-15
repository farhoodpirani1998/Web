import {
  Badge,
  Card,
  Heading,
  Link,
  Section,
  Stack,
  Text,
} from "@/shared/design-system/components";
import { campuses as fallbackCampuses } from "./data";
import { useCampuses } from "./useCampuses";

/**
 * Campuses page "Details" section — the expanded, in-depth view of
 * each campus (full description, all contact channels, full feature
 * list), distinct from `CampusList`'s compact overview cards.
 *
 * Presentation only, no business logic beyond the fetched-or-fallback
 * source selection below. Like `FAQ` (pre-registration feature), each
 * panel uses the native `<details>`/`<summary>` elements rather than a
 * controlled `open`/`onToggle` state — fully interactive,
 * keyboard/screen-reader accessible disclosure (§26), zero
 * React/component state. Each `<details>` carries the id `CampusCard`'s
 * "جزئیات بیشتر" link points at (`#campus-{id}`), so following that
 * link both scrolls to and (once the browser supports `:target`
 * auto-expansion, or once real interactivity is added later) reveals
 * the matching panel — no JS required for the scroll-to-anchor part.
 *
 * Backed by `useCampuses()` (the Public API's Campuses content
 * module, §4, §8), the same `useCampuses()` call `CampusList` makes —
 * TanStack Query dedupes the two into a single request/cache entry
 * (§14). Renders `data` once the query has resolved with at least one
 * item, and falls back to the local `fallbackCampuses` literal
 * (`./data`) while the query is loading, has errored, or the CMS has
 * nothing published yet — the same convention `NewsList`/`NewsDetails`
 * and `GalleryGrid`/`GalleryDetails` already use.
 */
export function CampusDetails() {
  const { data } = useCampuses();
  const campuses = data && data.length > 0 ? data : fallbackCampuses;

  return (
    <Section spacing="lg" tone="muted" aria-labelledby="campuses-details-heading">
      <Stack gap="md">
        <Heading id="campuses-details-heading" level={2}>
          جزئیات پردیس‌ها
        </Heading>

        <Stack gap="sm">
          {campuses.map((campus) => (
            <Card
              key={campus.id}
              variant="outline"
              padding="none"
              className="bg-background transition-colors hover:border-brand-gold/40"
            >
              <details id={`campus-${campus.id}`} className="group px-6 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <Stack gap="xs">
                    <Text as="span" variant="body" weight="semibold">
                      {campus.name}
                    </Text>
                    <Text as="span" variant="caption" color="muted">
                      {campus.area}
                    </Text>
                  </Stack>
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-foreground transition-transform group-open:rotate-180"
                  >
                    ⌄
                  </span>
                </summary>

                <Stack gap="sm" className="pt-3">
                  <Text variant="bodySm" color="muted">
                    {campus.detailedDescription}
                  </Text>

                  <Stack direction="row" gap="xs" wrap>
                    {campus.features.map((feature) => (
                      <Badge key={feature} variant="outline">
                        {feature}
                      </Badge>
                    ))}
                  </Stack>

                  <Stack gap="xs">
                    <Text variant="bodySm">{campus.address}</Text>
                    <Stack direction="row" gap="sm" wrap>
                      <Link href={campus.contact.phoneHref} variant="subtle">
                        {campus.contact.phone}
                      </Link>
                      {campus.contact.email && (
                        <Link href={`mailto:${campus.contact.email}`} variant="subtle">
                          {campus.contact.email}
                        </Link>
                      )}
                    </Stack>
                  </Stack>
                </Stack>
              </details>
            </Card>
          ))}
        </Stack>
      </Stack>
    </Section>
  );
}
