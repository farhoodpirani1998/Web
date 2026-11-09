import {
  Card,
  Grid,
  Section,
  SectionHeader,
  Stack,
  Text,
} from "@/shared/design-system/components";
import { useAboutPage } from "./useAboutPage";

export function AboutStats() {
  const { data } = useAboutPage();
  if (!data || data.stats.items.length === 0) return null;
  const stats = data.stats.items;

  return (
    <Section
      spacing="md"
      tone="muted"
      className="rounded-3xl"
      aria-labelledby="about-stats-heading"
    >
      <Stack gap="md">
        <SectionHeader
          headingId="about-stats-heading"
          headingLevel={2}
          eyebrow="آمار مجموعه"
          title={data.stats.title ?? "مجموعه در یک نگاه"}
        />
        {data.stats.description ? (
          <Text variant="lead" className="max-w-2xl">
            {data.stats.description}
          </Text>
        ) : null}
        <Grid cols="4" gap="md">
          {stats.map((stat) => (
            <Card
              key={stat.id}
              variant="elevated"
              padding="md"
              className="group relative overflow-hidden bg-background text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-1 bg-brand-gold"
              />
              <Stack gap="xs" align="center">
                <Text
                  as="span"
                  variant="body"
                  weight="bold"
                  className="font-heading text-3xl text-brand-gold lg:text-4xl"
                >
                  {stat.value}
                  {stat.suffix}
                </Text>
                <Text variant="bodySm" color="muted">
                  {stat.label}
                </Text>
              </Stack>
            </Card>
          ))}
        </Grid>
      </Stack>
    </Section>
  );
}
