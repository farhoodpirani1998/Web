import { Badge, Heading, Section, Stack, Text } from "@/shared/design-system/components";
import { useAboutPage } from "./useAboutPage";

export function AboutTimeline() {
  const { data } = useAboutPage();
  if (!data || data.timeline.items.length === 0) return null;
  const timeline = data.timeline.items;

  return (
    <Section spacing="lg" aria-labelledby="about-timeline-heading">
      <Stack gap="md">
        <Stack gap="xs" align="start">
          <Heading id="about-timeline-heading" level={2}>
            {data.timeline.title ?? "مسیر رشد"}
          </Heading>
          {data.timeline.description ? (
            <Text variant="bodySm" color="muted">
              {data.timeline.description}
            </Text>
          ) : null}
          <span
            aria-hidden="true"
            className="block h-1 w-16 rounded-full bg-brand-gold"
          />
        </Stack>

        <Stack gap="none" as="ol" className="border-s-2 border-brand-gold/30 ps-6">
          {timeline.map((item, index) => {
            const isLast = index === timeline.length - 1;
            return (
              <Stack
                key={item.id}
                as="li"
                gap="xs"
                className={`relative ${isLast ? "pb-0 pt-6 first:pt-0" : "pb-6 pt-6 first:pt-0"}`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute -start-[1.875rem] top-7 h-3 w-3 rounded-full border-2 border-brand-gold ${
                    isLast ? "bg-brand-gold" : "bg-background"
                  }`}
                />
                <Badge variant="secondary" className="w-fit">
                  {item.year}
                </Badge>
                <Text as="span" weight="semibold" className="font-heading">
                  {item.title}
                </Text>
                <Text variant="bodySm" color="muted">
                  {item.description}
                </Text>
              </Stack>
            );
          })}
        </Stack>
      </Stack>
    </Section>
  );
}
