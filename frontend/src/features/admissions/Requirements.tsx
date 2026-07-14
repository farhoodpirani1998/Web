import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Grid,
  Heading,
  Section,
  Stack,
  Text,
} from "@/shared/design-system/components";
import { requirements } from "./data";
import { BookIcon, CalendarIcon, ChatIcon, MapPinIcon } from "./icons";

/**
 * Admissions page "Requirements" section — eligibility criteria for
 * admission.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Grid`, `Card`, `Heading`, `Text`) —
 * no data fetching, no business logic. Requirement items are grouped
 * into a local array literal (`./data`) rather than interleaved in
 * JSX (Website Frontend Architecture §4, §8), so swapping this for a
 * `useAdmissions()`-style data hook later is a matter of replacing
 * that literal — this component's JSX does not need to change. Real
 * copy is ultimately the backend's Admissions content-module data;
 * this renders frontend-owned Persian placeholder copy in the
 * meantime.
 *
 * Visual refresh: cards move from the plain `outline` variant to the
 * `elevated` + hover-lift + navy/gold icon medallion treatment already
 * established by `AboutValues`/`ContactInfo`/this feature's own
 * `Hero` (icons chosen per `requirement.id`, purely presentational —
 * no new data field), plus the gold underline heading accent used
 * across the redesigned pages.
 */

/**
 * Maps a `requirements` entry's `id` to a decorative icon for its
 * medallion — the same lookup technique `@/features/contact`'s
 * `getContactIcon` uses. Purely presentational; an unknown id falls
 * back to a neutral book glyph rather than throwing.
 */
function getRequirementIcon(id: string) {
  if (id === "age") return CalendarIcon;
  if (id === "residency") return MapPinIcon;
  if (id === "interview") return ChatIcon;
  return BookIcon;
}

export function Requirements() {
  return (
    <Section
      spacing="lg"
      tone="muted"
      className="rounded-lg"
      aria-labelledby="admissions-requirements-heading"
    >
      <Stack gap="md">
        <Stack gap="xs" align="start">
          <Heading id="admissions-requirements-heading" level={2}>
            شرایط پذیرش
          </Heading>
          <span aria-hidden="true" className="block h-1 w-16 rounded-full bg-brand-gold" />
        </Stack>
        <Grid cols="2" gap="md">
          {requirements.map((requirement) => {
            const Icon = getRequirementIcon(requirement.id);
            return (
              <Card
                key={requirement.id}
                variant="elevated"
                padding="md"
                className="group bg-background transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <CardHeader className="flex-row items-center gap-3 p-0">
                  <span
                    aria-hidden="true"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-navy text-brand-gold"
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <CardTitle className="font-heading">{requirement.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 pt-3">
                  <Text variant="bodySm" color="muted">
                    {requirement.description}
                  </Text>
                </CardContent>
              </Card>
            );
          })}
        </Grid>
      </Stack>
    </Section>
  );
}
