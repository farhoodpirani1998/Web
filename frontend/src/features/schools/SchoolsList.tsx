import { MapPin, Phone } from "lucide-react";

import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Grid,
  Link,
  MediaFrame,
  Section,
  SectionHeader,
  Stack,
  Text,
  buttonVariants,
} from "@/shared/design-system/components";
import { useCampuses } from "@/features/campuses";
import { cn } from "@/shared/utils/cn";

/**
 * Schools page "List" section — the campus/branch directory.
 *
 * The `schools`/`campuses` split was a frontend-only duplication: both
 * listed the same physical branches with the same fields. Now backed by
 * the Campuses CMS module via `useCampuses()` (§4, §8) — the same data
 * the Campuses page renders — so a branch added/edited in the admin
 * panel shows here too. The local literal is kept as the fallback while
 * the request is loading / errors / returns empty, the same convention
 * `CampusList`/`TeacherGrid` already use.
 *
 * `isMain` stays a presentation-only flag derived from the order (the
 * first campus is the main branch), since the backend has no such field.
 */
interface SchoolListItem {
  id: string;
  slug?: string;
  name: string;
  area: string;
  address: string;
  phone: string;
  image?: { src: string; alt: string };
}

const fallbackSchools: readonly SchoolListItem[] = [
  {
    id: "central",
    name: "شعبه مرکزی",
    area: "تهران، مرکز شهر",
    address: "خیابان انقلاب، نرسیده به میدان فردوسی، پلاک ۱۲",
    phone: "۰۲۱-۱۲۳۴۵۶۷۸",
  },
  {
    id: "west",
    name: "شعبه غرب تهران",
    area: "تهران، منطقه غرب",
    address: "بلوار اشرفی اصفهانی، خیابان نمونه، پلاک ۴۵",
    phone: "۰۲۱-۲۳۴۵۶۷۸۹",
  },
  {
    id: "east",
    name: "شعبه شرق تهران",
    area: "تهران، منطقه شرق",
    address: "خیابان پیروزی، خیابان نمونه، پلاک ۷۸",
    phone: "۰۲۱-۳۴۵۶۷۸۹۰",
  },
  {
    id: "karaj",
    name: "شعبه کرج",
    area: "البرز، کرج",
    address: "بلوار طالقانی، خیابان نمونه، پلاک ۲۳",
    phone: "۰۲۶-۱۲۳۴۵۶۷۸",
  },
  {
    id: "isfahan",
    name: "شعبه اصفهان",
    area: "اصفهان",
    address: "خیابان چهارباغ، خیابان نمونه، پلاک ۵۶",
    phone: "۰۳۱-۱۲۳۴۵۶۷۸",
  },
  {
    id: "mashhad",
    name: "شعبه مشهد",
    area: "خراسان رضوی، مشهد",
    address: "بلوار وکیل‌آباد، خیابان نمونه، پلاک ۸۹",
    phone: "۰۵۱-۱۲۳۴۵۶۷۸",
  },
];

function toTelHref(phone: string): string {
  const localized = "۰۱۲۳۴۵۶۷۸۹";
  const ascii = "0123456789";
  const normalized = phone
    .replace(/[۰-۹]/g, (d) => ascii[localized.indexOf(d)])
    .replace(/[^\d+]/g, "");
  return `tel:${normalized}`;
}

export function SchoolsList() {
  const { data } = useCampuses();

  const schools: readonly SchoolListItem[] =
    data && data.length > 0
      ? data.map((campus) => ({
          id: campus.id,
          slug: campus.slug,
          name: campus.name,
          area: campus.area ?? campus.address ?? "",
          address: campus.address ?? "",
          phone: campus.contact.phone ?? "",
          image: campus.image.src
            ? { src: campus.image.src, alt: campus.image.alt }
            : undefined,
        }))
      : fallbackSchools;

  return (
    <Section spacing="lg" aria-labelledby="schools-list-heading">
      <Stack gap="xl">
        <SectionHeader
          headingId="schools-list-heading"
          eyebrow="فهرست شعب"
          title="شعب گروه آموزشی"
          description="شعبه‌ی موردنظر خود را بر پایه موقعیت جغرافیایی انتخاب کنید."
        />

        <Grid cols="3" gap="lg">
          {schools.map((school, index) => {
            const isMain = index === 0;
            return (
              <Card
                key={school.id}
                variant="elevated"
                padding="none"
                className={cn(
                  "group overflow-hidden bg-background transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
                  isMain && "ring-1 ring-brand-gold/50",
                )}
              >
                <MediaFrame
                  src={school.image?.src}
                  alt={school.image?.alt ?? school.name}
                />

                <CardHeader className="gap-1.5 p-5 pb-0">
                  <Stack gap="xs" align="start">
                    {isMain ? (
                      <Badge className="rounded-full bg-brand-gold text-brand-navy hover:bg-brand-gold/90">
                        شعبه اصلی
                      </Badge>
                    ) : null}
                    <CardTitle className="text-lg">{school.name}</CardTitle>
                    {school.area ? (
                      <Text variant="bodySm" color="muted">
                        {school.area}
                      </Text>
                    ) : null}
                  </Stack>
                </CardHeader>

                <CardContent className="p-5 pt-4">
                  <Stack gap="sm" className="border-t border-border pt-4">
                    {school.address ? (
                      <Stack direction="row" gap="sm" align="start">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold" />
                        <Text variant="bodySm" color="muted">
                          {school.address}
                        </Text>
                      </Stack>
                    ) : null}
                    {school.phone ? (
                      <Stack direction="row" gap="sm" align="center">
                        <Phone className="h-4 w-4 shrink-0 text-brand-gold" />
                        <Link href={toTelHref(school.phone)} variant="subtle" dir="ltr">
                          {school.phone}
                        </Link>
                      </Stack>
                    ) : null}
                    {school.slug ? (
                      <Link
                        href={`/campuses/${school.slug}`}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "sm" }),
                          "mt-1 w-fit px-0 text-brand-navy hover:bg-transparent hover:text-brand-gold",
                        )}
                      >
                        جزئیات شعبه
                      </Link>
                    ) : null}
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Grid>
      </Stack>
    </Section>
  );
}
