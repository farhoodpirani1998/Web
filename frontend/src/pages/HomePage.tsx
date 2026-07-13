import {
  buttonVariants,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Grid,
  Heading,
  Link,
  PageLayout,
  Section,
  Stack,
  Text,
} from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";

/**
 * Root-route page.
 *
 * Homepage sections (Hero, Stats, About, Campuses, ...) are each a
 * separate content module/feature and remain out of scope one at a
 * time until their own sprints (Website Frontend Architecture §10
 * "Section Architecture", §11 "Component Hierarchy").
 *
 * This sprint adds the Hero, Features, and CTA sections, composed
 * entirely from existing design-system primitives (`Section`, `Stack`,
 * `Heading`, `Text`, `Link`/`buttonVariants`, `Grid`, `Card`) — no new
 * components, no data fetching. Real copy/CTAs and feature items are
 * ultimately backend-owned content (Website Frontend Architecture §4,
 * §8), so this renders frontend-owned placeholder copy only, the same
 * convention used by `AboutPage`/`ContactPage`; swapping any section
 * for a `useHero()`/`useFeatures()`/`useCta()`-style data hook later is
 * additive.
 */
export function HomePage() {
  return (
    <PageLayout>
      <Section spacing="lg" aria-labelledby="home-hero-heading">
        <Stack gap="lg" align="center" className="min-h-[60vh] justify-center text-center">
          <Stack gap="sm" align="center">
            <Heading id="home-hero-heading" level={1}>
              Placeholder hero headline
            </Heading>
            <Text variant="lead" className="max-w-2xl">
              Placeholder hero supporting copy. This stands in for the
              introductory statement that will eventually be sourced from
              the backend's Public API once the Hero content module
              exists.
            </Text>
          </Stack>

          <Stack direction="row" gap="sm" wrap className="justify-center">
            <Link href="/about" className={cn(buttonVariants({ variant: "default", size: "lg" }))}>
              Learn more
            </Link>
            <Link href="/contact" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
              Contact us
            </Link>
          </Stack>
        </Stack>
      </Section>

      <Section spacing="lg" aria-labelledby="home-features-heading">
        <Stack gap="lg">
          <Stack gap="sm" align="center" className="text-center">
            <Heading id="home-features-heading" level={2}>
              Placeholder features headline
            </Heading>
            <Text variant="lead" className="max-w-2xl">
              Placeholder features intro copy. This stands in for the
              summary that will eventually be sourced from the backend's
              Public API once the Features content module exists.
            </Text>
          </Stack>

          <Grid cols="3" gap="md">
            <Card variant="outline" padding="md">
              <CardHeader className="p-0">
                <CardTitle>Placeholder feature one</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pt-2">
                <Text variant="bodySm" color="muted">
                  Placeholder description for the first feature item.
                </Text>
              </CardContent>
            </Card>

            <Card variant="outline" padding="md">
              <CardHeader className="p-0">
                <CardTitle>Placeholder feature two</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pt-2">
                <Text variant="bodySm" color="muted">
                  Placeholder description for the second feature item.
                </Text>
              </CardContent>
            </Card>

            <Card variant="outline" padding="md">
              <CardHeader className="p-0">
                <CardTitle>Placeholder feature three</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pt-2">
                <Text variant="bodySm" color="muted">
                  Placeholder description for the third feature item.
                </Text>
              </CardContent>
            </Card>
          </Grid>
        </Stack>
      </Section>

      <Section spacing="lg" tone="primary" className="rounded-lg" aria-labelledby="home-cta-heading">
        <Stack gap="md" align="center" className="text-center px-6">
          <Heading id="home-cta-heading" level={2} color="inherit">
            Placeholder CTA headline
          </Heading>
          <Text variant="lead" color="inherit" className="max-w-2xl">
            Placeholder CTA supporting copy. This stands in for the closing
            call to action that will eventually be sourced from the
            backend's Public API once the CTA content module exists.
          </Text>
          <Link href="/contact" className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}>
            Contact us
          </Link>
        </Stack>
      </Section>
    </PageLayout>
  );
}
