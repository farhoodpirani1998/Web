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

import { useSiteSettings } from "./useSiteSettings";

/**
 * Site Settings "Contact Information" section — the address/phone/
 * email fields a real Site Settings record would carry, following the
 * same pattern as `hero`/`about`/`contact`/`schools`/`news`/`gallery`/
 * `statistics`.
 *
 * Backed by `useSiteSettings()` (Website Frontend Architecture §4, §8).
 * Fields are still driven by a local array literal so the layout below
 * doesn't need to change, but each field's `value`/`href` now reads
 * from the API response, falling back to the section's original
 * frontend-owned placeholder while the query is loading, has errored,
 * or the field is absent (e.g. optional `fax`/`email`). This is the
 * same category of data the `contact` feature's `ContactInfo` renders
 * on the public Contact page; here it is scoped as the underlying Site
 * Settings *fields* rather than that page's own copy.
 */

const CONTACT_PLACEHOLDERS = {
  address: "آدرس نمونه، خیابان نمونه، شهر نمونه.",
  phone: "+0 (000) 000-0000",
  phoneHref: "tel:+0000000000",
  fax: "+0 (000) 000-0001",
  email: "info@example.com",
  emailHref: "mailto:info@example.com",
} as const;

export function ContactInformation() {
  const { data } = useSiteSettings();
  const contact = data?.contact;

  const contactFields = [
    {
      id: "address",
      label: "آدرس",
      type: "text" as const,
      value: contact?.address ?? CONTACT_PLACEHOLDERS.address,
    },
    {
      id: "phone",
      label: "تلفن",
      type: "link" as const,
      value: contact?.phone ?? CONTACT_PLACEHOLDERS.phone,
      href: contact?.phoneHref ?? CONTACT_PLACEHOLDERS.phoneHref,
    },
    {
      id: "fax",
      label: "دورنگار",
      type: "text" as const,
      value: contact?.fax ?? CONTACT_PLACEHOLDERS.fax,
    },
    {
      id: "email",
      label: "ایمیل",
      type: "link" as const,
      value: contact?.email ?? CONTACT_PLACEHOLDERS.email,
      href: contact?.emailHref ?? CONTACT_PLACEHOLDERS.emailHref,
    },
  ];

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
