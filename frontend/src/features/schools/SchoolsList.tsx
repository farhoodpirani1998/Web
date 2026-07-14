import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Grid,
  Heading,
  Link,
  Section,
  Stack,
  Text,
} from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";

/**
 * Schools page "List" section — the campus/branch directory, following
 * the same pattern as `hero`/`features`/`cta`/`about`/`contact`.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Grid`, `Card`, `Badge`, `Link`,
 * `Text`) — no data fetching, no business logic. Campus entries are
 * grouped into a local array literal rather than interleaved in JSX
 * (Website Frontend Architecture §4, §8), so the eventual swap to a
 * `useSchools()`-style data hook is a matter of replacing this literal
 * — the layout and design-system wiring below do not need to change.
 * Real names/addresses/phone numbers are ultimately the backend's
 * Campuses content-module data; this renders frontend-owned Persian
 * placeholder copy in the meantime, consistent with the six active
 * branches referenced on the About page.
 *
 * Brand pass: cards move from a plain outline treatment to the shared
 * `elevated`/hover-lift language `Features`/`StatisticsGrid` already
 * use, each gets a small gold accent rule under its title plus
 * pin/phone glyphs (local, `aria-hidden` SVG helpers, the same
 * convention `Header`/`Hero`/`Footer` already follow — not a new
 * shared component), and the central branch — already called out as
 * "شعبه مرکزی" in the copy — is visually promoted with a gold ring and
 * a small "شعبه اصلی" marker so the hierarchy reads at a glance. This
 * `isMain` flag is a purely local, presentation-only literal, not
 * backend-owned data.
 */

const schools = [
  {
    id: "central",
    name: "شعبه مرکزی",
    area: "تهران، مرکز شهر",
    address: "خیابان انقلاب، نرسیده به میدان فردوسی، پلاک ۱۲",
    phone: "۰۲۱-۱۲۳۴۵۶۷۸",
    phoneHref: "tel:+982112345678",
    isMain: true,
  },
  {
    id: "west",
    name: "شعبه غرب تهران",
    area: "تهران، منطقه غرب",
    address: "بلوار اشرفی اصفهانی، خیابان نمونه، پلاک ۴۵",
    phone: "۰۲۱-۲۳۴۵۶۷۸۹",
    phoneHref: "tel:+982123456789",
    isMain: false,
  },
  {
    id: "east",
    name: "شعبه شرق تهران",
    area: "تهران، منطقه شرق",
    address: "خیابان پیروزی، خیابان نمونه، پلاک ۷۸",
    phone: "۰۲۱-۳۴۵۶۷۸۹۰",
    phoneHref: "tel:+982134567890",
    isMain: false,
  },
  {
    id: "karaj",
    name: "شعبه کرج",
    area: "البرز، کرج",
    address: "بلوار طالقانی، خیابان نمونه، پلاک ۲۳",
    phone: "۰۲۶-۱۲۳۴۵۶۷۸",
    phoneHref: "tel:+982612345678",
    isMain: false,
  },
  {
    id: "isfahan",
    name: "شعبه اصفهان",
    area: "اصفهان",
    address: "خیابان چهارباغ، خیابان نمونه، پلاک ۵۶",
    phone: "۰۳۱-۱۲۳۴۵۶۷۸",
    phoneHref: "tel:+983112345678",
    isMain: false,
  },
  {
    id: "mashhad",
    name: "شعبه مشهد",
    area: "خراسان رضوی، مشهد",
    address: "بلوار وکیل‌آباد، خیابان نمونه، پلاک ۸۹",
    phone: "۰۵۱-۱۲۳۴۵۶۷۸",
    phoneHref: "tel:+985112345678",
    isMain: false,
  },
] as const;

export function SchoolsList() {
  return (
    <Section spacing="lg" tone="muted" aria-labelledby="schools-list-heading">
      <Stack gap="lg">
        <Stack gap="xs" align="start">
          <Heading id="schools-list-heading" level={2}>
            فهرست شعب
          </Heading>
          <span aria-hidden="true" className="block h-1 w-16 rounded-full bg-brand-gold" />
        </Stack>

        <Grid cols="3" gap="lg">
          {schools.map((school) => (
            <Card
              key={school.id}
              variant="elevated"
              padding="lg"
              className={cn(
                "relative bg-background transition-shadow duration-300 hover:shadow-lg",
                school.isMain && "ring-1 ring-brand-gold/50 shadow-md",
              )}
            >
              <CardHeader className="gap-2 p-0">
                <Stack direction="row" align="center" justify="between" gap="sm">
                  <CardTitle className="font-heading">{school.name}</CardTitle>
                  {school.isMain ? (
                    <Badge className="shrink-0 rounded-full bg-brand-gold text-brand-navy hover:bg-brand-gold/90">
                      شعبه اصلی
                    </Badge>
                  ) : null}
                </Stack>
                <Badge
                  variant="outline"
                  className="w-fit rounded-full border-brand-gold/40 bg-brand-gold/10 text-brand-navy"
                >
                  {school.area}
                </Badge>
              </CardHeader>

              <CardContent className="p-0 pt-4">
                <Stack gap="sm">
                  <Stack direction="row" gap="sm" align="start">
                    <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold" />
                    <Text variant="bodySm" color="muted">
                      {school.address}
                    </Text>
                  </Stack>
                  <Stack direction="row" gap="sm" align="center">
                    <PhoneIcon className="h-4 w-4 shrink-0 text-brand-gold" />
                    <Link href={school.phoneHref} variant="subtle" dir="ltr">
                      {school.phone}
                    </Link>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Stack>
    </Section>
  );
}

/** Decorative address-pin glyph. Presentational only. */
function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.25" />
    </svg>
  );
}

/** Decorative phone-receiver glyph. Presentational only. */
function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.2 1L6.6 10.8Z" />
    </svg>
  );
}
