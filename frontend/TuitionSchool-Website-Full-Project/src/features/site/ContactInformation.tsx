import {
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
 * Site Settings "Contact Information" section — the address/phone/
 * email fields a real Site Settings record would carry, following the
 * same pattern as `hero`/`about`/`contact`/`schools`/`news`/`gallery`/
 * `statistics`.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Grid`, `Card`, `Link`, `Text`) — no
 * data fetching, no business logic. Fields are grouped into a local
 * array literal (Website Frontend Architecture §4, §8) shaped the way
 * a future `useSiteSettings()` data hook's result would look, so the
 * eventual swap is a matter of replacing this literal — the layout and
 * design-system wiring below do not need to change. This is the same
 * category of data the `contact` feature's `ContactInfo` renders on the
 * public Contact page; here it is scoped as the underlying Site
 * Settings *fields* rather than that page's own copy.
 */

const contactFields = [
  {
    id: "address",
    label: "آدرس",
    type: "text",
    value: "آدرس نمونه، خیابان نمونه، شهر نمونه.",
  },
  {
    id: "phone",
    label: "تلفن",
    type: "link",
    value: "+0 (000) 000-0000",
    href: "tel:+0000000000",
  },
  {
    id: "fax",
    label: "دورنگار",
    type: "text",
    value: "+0 (000) 000-0001",
  },
  {
    id: "email",
    label: "ایمیل",
    type: "link",
    value: "info@example.com",
    href: "mailto:info@example.com",
  },
] as const;

export function ContactInformation() {
  return (
    <Section spacing="lg" aria-labelledby="site-contact-heading">
      <Stack gap="md">
        <Heading id="site-contact-heading" level={2}>
          اطلاعات تماس
        </Heading>
        <Grid cols="4" gap="md">
          {contactFields.map((field) => (
            <Card key={field.id} variant="outline" padding="md">
              <CardHeader className="p-0">
                <CardTitle>{field.label}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pt-2">
                {field.type === "link" ? (
                  <Link href={field.href} variant="subtle" dir="ltr" className="inline-block">
                    {field.value}
                  </Link>
                ) : (
                  <Text variant="bodySm" color="muted">
                    {field.value}
                  </Text>
                )}
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Stack>
    </Section>
  );
}
