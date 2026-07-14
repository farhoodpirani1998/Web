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
import { requiredDocuments } from "./data";
import { CameraIcon, DocumentIcon, HeartIcon, IdCardIcon, SwapIcon } from "./icons";

/**
 * Admissions page "Required Documents" section — the checklist of
 * documents needed to complete a student's file.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Grid`, `Card`, `Heading`, `Text`) —
 * no data fetching, no business logic. Reuses the same card-grid
 * pattern as this feature's own `Requirements` and
 * `@/features/about`'s `AboutValues`, at a three-column density since
 * each entry is a short document label rather than a longer
 * explanation. Document items are grouped into a local array literal
 * (`./data`) rather than interleaved in JSX (Website Frontend
 * Architecture §4, §8), so swapping this for a `useAdmissions()`-style
 * data hook later is a matter of replacing that literal — this
 * component's JSX does not need to change. Real copy is ultimately the
 * backend's Admissions content-module data; this renders
 * frontend-owned Persian placeholder copy in the meantime.
 *
 * Visual refresh: cards move from the plain `outline` variant to the
 * `elevated` + hover-lift + navy/gold icon medallion treatment already
 * established by `AboutValues`/`ContactInfo`/this feature's own
 * `Requirements` (icons chosen per `document.id`, purely
 * presentational — no new data field, falling back to a generic
 * document glyph for any id without a specific one), plus the gold
 * underline heading accent used across the redesigned pages.
 */

/**
 * Maps a `requiredDocuments` entry's `id` to a decorative icon for its
 * medallion — the same lookup technique `@/features/contact`'s
 * `getContactIcon` uses. Purely presentational; an unknown id falls
 * back to a neutral document glyph rather than throwing.
 */
function getDocumentIcon(id: string) {
  if (id === "national-id") return IdCardIcon;
  if (id === "photos") return CameraIcon;
  if (id === "transfer-letter") return SwapIcon;
  if (id === "health-record") return HeartIcon;
  return DocumentIcon;
}

export function RequiredDocuments() {
  return (
    <Section spacing="lg" aria-labelledby="admissions-documents-heading">
      <Stack gap="md">
        <Stack gap="xs" align="start">
          <Heading id="admissions-documents-heading" level={2}>
            مدارک مورد نیاز
          </Heading>
          <span aria-hidden="true" className="block h-1 w-16 rounded-full bg-brand-gold" />
        </Stack>
        <Grid cols="3" gap="md">
          {requiredDocuments.map((document) => {
            const Icon = getDocumentIcon(document.id);
            return (
              <Card
                key={document.id}
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
                  <CardTitle className="font-heading text-base">{document.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 pt-3">
                  <Text variant="bodySm" color="muted">
                    {document.description}
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
