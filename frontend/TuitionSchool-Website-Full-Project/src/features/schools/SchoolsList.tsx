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
 */

const schools = [
  {
    id: "central",
    name: "شعبه مرکزی",
    area: "تهران، مرکز شهر",
    address: "خیابان انقلاب، نرسیده به میدان فردوسی، پلاک ۱۲",
    phone: "۰۲۱-۱۲۳۴۵۶۷۸",
    phoneHref: "tel:+982112345678",
  },
  {
    id: "west",
    name: "شعبه غرب تهران",
    area: "تهران، منطقه غرب",
    address: "بلوار اشرفی اصفهانی، خیابان نمونه، پلاک ۴۵",
    phone: "۰۲۱-۲۳۴۵۶۷۸۹",
    phoneHref: "tel:+982123456789",
  },
  {
    id: "east",
    name: "شعبه شرق تهران",
    area: "تهران، منطقه شرق",
    address: "خیابان پیروزی، خیابان نمونه، پلاک ۷۸",
    phone: "۰۲۱-۳۴۵۶۷۸۹۰",
    phoneHref: "tel:+982134567890",
  },
  {
    id: "karaj",
    name: "شعبه کرج",
    area: "البرز، کرج",
    address: "بلوار طالقانی، خیابان نمونه، پلاک ۲۳",
    phone: "۰۲۶-۱۲۳۴۵۶۷۸",
    phoneHref: "tel:+982612345678",
  },
  {
    id: "isfahan",
    name: "شعبه اصفهان",
    area: "اصفهان",
    address: "خیابان چهارباغ، خیابان نمونه، پلاک ۵۶",
    phone: "۰۳۱-۱۲۳۴۵۶۷۸",
    phoneHref: "tel:+983112345678",
  },
  {
    id: "mashhad",
    name: "شعبه مشهد",
    area: "خراسان رضوی، مشهد",
    address: "بلوار وکیل‌آباد، خیابان نمونه، پلاک ۸۹",
    phone: "۰۵۱-۱۲۳۴۵۶۷۸",
    phoneHref: "tel:+985112345678",
  },
] as const;

export function SchoolsList() {
  return (
    <Section spacing="lg" aria-labelledby="schools-list-heading">
      <Stack gap="md">
        <Heading id="schools-list-heading" level={2}>
          فهرست شعب
        </Heading>
        <Grid cols="3" gap="md">
          {schools.map((school) => (
            <Card key={school.id} variant="outline" padding="md">
              <CardHeader className="p-0">
                <Stack gap="xs">
                  <CardTitle>{school.name}</CardTitle>
                  <Badge variant="secondary" className="w-fit">
                    {school.area}
                  </Badge>
                </Stack>
              </CardHeader>
              <CardContent className="p-0 pt-2">
                <Stack gap="xs">
                  <Text variant="bodySm" color="muted">
                    {school.address}
                  </Text>
                  <Link href={school.phoneHref} variant="subtle">
                    {school.phone}
                  </Link>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Stack>
    </Section>
  );
}
