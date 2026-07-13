import {
  Card,
  Heading,
  Section,
  Separator,
  Stack,
  Typography,
} from "@/shared/design-system/components";

/**
 * Site Settings "Working Hours" section — the weekly schedule a real
 * Site Settings record would carry, following the same pattern as
 * `hero`/`about`/`contact`/`schools`/`news`/`gallery`/`statistics`.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Card`, `Separator`, `Text`) — no
 * data fetching, no business logic. Days are grouped into a local
 * array literal, shaped the way a future `useSiteSettings()` data
 * hook's result would look, so the eventual swap is a matter of
 * replacing this literal.
 *
 * Rendered as a `<dl>` (day = term, hours = description) rather than a
 * generic `Grid`/`Card` row list — this is genuinely paired label/value
 * data, so the semantic list primitive gives assistive technology an
 * explicit structure to announce instead of relying on visual
 * proximity alone (§26 accessibility).
 */

const workingHours = [
  { id: "sat-wed", day: "شنبه تا چهارشنبه", hours: "۸:۰۰ تا ۱۶:۰۰" },
  { id: "thu", day: "پنجشنبه", hours: "۸:۰۰ تا ۱۲:۰۰" },
  { id: "fri", day: "جمعه", hours: "تعطیل" },
] as const;

export function WorkingHours() {
  return (
    <Section spacing="lg" aria-labelledby="site-hours-heading">
      <Stack gap="md">
        <Heading id="site-hours-heading" level={2}>
          ساعات کاری
        </Heading>
        <Card variant="outline" padding="md" className="max-w-xl">
          <Stack as="dl" gap="none" className="m-0">
            {workingHours.map((row, index) => (
              <div key={row.id}>
                {index > 0 && <Separator className="my-3" />}
                <Stack direction="row" justify="between" align="center" gap="sm">
                  <Typography as="dt" variant="body" weight="semibold">
                    {row.day}
                  </Typography>
                  <Typography as="dd" variant="bodySm" color="muted" className="m-0">
                    {row.hours}
                  </Typography>
                </Stack>
              </div>
            ))}
          </Stack>
        </Card>
      </Stack>
    </Section>
  );
}
