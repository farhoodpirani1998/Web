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
import { toTelephoneHref } from "@/shared/config/contact";

type ContactField =
  | { id: string; label: string; type: "text"; value: string }
  | { id: string; label: string; type: "link"; value: string; href: string };

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

export function ContactInformation() {
  const { data } = useSiteSettings();
  const contactFields: ContactField[] = [];
  if (data?.address?.fa) {
    contactFields.push(
      data.mapUrl
        ? { id: "address", label: "آدرس", type: "link", value: data.address.fa, href: data.mapUrl }
        : { id: "address", label: "آدرس", type: "text", value: data.address.fa },
    );
  }
  if (data?.contactPhone) {
    contactFields.push({
      id: "phone",
      label: "تلفن",
      type: "link",
      value: data.contactPhone,
      href: toTelephoneHref(data.contactPhone),
    });
  }
  if (data?.contactEmail) {
    contactFields.push({
      id: "email",
      label: "ایمیل",
      type: "link",
      value: data.contactEmail,
      href: `mailto:${data.contactEmail}`,
    });
  }

  if (contactFields.length === 0) return null;

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
