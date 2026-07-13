import { Card, CardContent, CardHeader, CardTitle, Grid, Link, Text } from "@/shared/design-system/components";

/**
 * Contact page "Info" section (address/phone/email cards) — extracted
 * from `ContactPage`'s inline markup without changing layout or
 * styling, following the same pattern as the `hero`/`features`/`cta`/
 * `about` features.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Grid`, `Card`, `Link`, `Text`) — no data fetching, no
 * business logic. Contact items are grouped into a local array literal
 * rather than interleaved in JSX (Website Frontend Architecture §4,
 * §8), so the eventual swap to a `useSiteSettings()`-style data hook is
 * a matter of replacing this literal — the layout and design-system
 * wiring below do not need to change. Real address/phone/email are
 * ultimately Site Settings–derived content (the same category of data
 * the app-shell's `Footer` consumes); this renders frontend-owned
 * Persian placeholder copy in the meantime.
 */

const contactItems = [
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
    id: "email",
    label: "ایمیل",
    type: "link",
    value: "info@example.com",
    href: "mailto:info@example.com",
  },
] as const;

export function ContactInfo() {
  return (
    <Grid cols="3" gap="md">
      {contactItems.map((item) => (
        <Card key={item.id} variant="outline" padding="md">
          <CardHeader className="p-0">
            <CardTitle>{item.label}</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            {item.type === "link" ? (
              <Link href={item.href} variant="subtle">
                {item.value}
              </Link>
            ) : (
              <Text variant="bodySm" color="muted">
                {item.value}
              </Text>
            )}
          </CardContent>
        </Card>
      ))}
    </Grid>
  );
}
