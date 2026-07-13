import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Grid,
  Heading,
  Link,
  PageLayout,
  Stack,
  Text,
} from "@/shared/design-system/components";

/**
 * Static "Contact" page (Sprint 3B "Website Pages Foundation").
 *
 * Fixed singular page, route `/contact`. Contact details (address,
 * phone, email, working hours) are ultimately Site Settings–derived
 * content (Website Frontend Architecture §8 "Layout Architecture" —
 * the same category of data the app-shell's future Footer will
 * consume), so this page only renders frontend-owned placeholder
 * strings for now — swapping them for a `useSiteSettings()`-style data
 * hook later is additive.
 *
 * A contact **form** is a distinct, unbuilt backend capability (no
 * public form-submission endpoint exists in the Public API contract).
 * Per the architecture's working rules ("never mock or assume the
 * shape of an undocumented capability"), this page deliberately does
 * not include a form, submit handler, or any client-side validation —
 * it is named here only as a future extension point.
 */
export function ContactPage() {
  return (
    <PageLayout>
      <Stack gap="lg">
        <Stack gap="sm">
          <Heading level={1}>Contact us — placeholder title</Heading>
          <Text variant="lead">
            Placeholder introductory copy for how visitors can reach the
            Group. Real contact details will be sourced from the backend
            once the relevant content is available.
          </Text>
        </Stack>

        <Grid cols="3" gap="md">
          <Card variant="outline" padding="md">
            <CardHeader className="p-0">
              <CardTitle>Address</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <Text variant="bodySm" color="muted">
                Placeholder address line one, placeholder city.
              </Text>
            </CardContent>
          </Card>

          <Card variant="outline" padding="md">
            <CardHeader className="p-0">
              <CardTitle>Phone</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <Link href="tel:+0000000000" variant="subtle">
                +0 (000) 000-0000
              </Link>
            </CardContent>
          </Card>

          <Card variant="outline" padding="md">
            <CardHeader className="p-0">
              <CardTitle>Email</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <Link href="mailto:info@example.com" variant="subtle">
                info@example.com
              </Link>
            </CardContent>
          </Card>
        </Grid>
      </Stack>
    </PageLayout>
  );
}
