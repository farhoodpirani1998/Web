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
import { useAboutPage } from "./useAboutPage";

export function AboutValues() {
  const { data } = useAboutPage();
  if (!data || data.values.items.length === 0) return null;
  const values = data.values.items;

  return (
    <Section
      spacing="lg"
      tone="muted"
      className="rounded-lg"
      aria-labelledby="about-values-heading"
    >
      <Stack gap="md">
        <Stack gap="sm">
          <Heading id="about-values-heading" level={2}>
            {data.values.title ?? "ارزش‌های ما"}
          </Heading>
          {data.values.description ? (
            <Text variant="lead" className="max-w-2xl">
              {data.values.description}
            </Text>
          ) : null}
        </Stack>

        <Grid cols="2" gap="lg">
          {values.map((value) => (
            <Card
              key={value.id}
              variant="elevated"
              padding="lg"
              className="group relative overflow-hidden bg-background transition-shadow duration-300 hover:shadow-lg"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -end-2 -top-4 font-heading text-6xl font-bold text-brand-navy/5"
              >
                {value.index}
              </span>

              <CardHeader className="relative gap-3 p-0">
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-brand-gold"
                >
                  {value.index}
                </span>
                <CardTitle className="font-heading">{value.title}</CardTitle>
              </CardHeader>

              <CardContent className="relative p-0 pt-3">
                <Text variant="bodySm" color="muted">
                  {value.description}
                </Text>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Stack>
    </Section>
  );
}
