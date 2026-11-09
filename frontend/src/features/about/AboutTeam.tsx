import {
  Avatar,
  Card,
  Grid,
  Heading,
  Section,
  Stack,
  Text,
} from "@/shared/design-system/components";
import { useAboutPage } from "./useAboutPage";

export function AboutTeam() {
  const { data } = useAboutPage();
  if (!data || data.team.items.length === 0) return null;
  const team = data.team.items;

  return (
    <Section spacing="lg" aria-labelledby="about-team-heading">
      <Stack gap="md">
        <Stack gap="sm">
          <Heading id="about-team-heading" level={2}>
            {data.team.title ?? "اعضای تیم"}
          </Heading>
          {data.team.description ? (
            <Text variant="lead" className="max-w-2xl">
              {data.team.description}
            </Text>
          ) : null}
        </Stack>

        <Grid cols="3" gap="lg">
          {team.map((member) => (
            <Card
              key={member.id}
              variant="elevated"
              padding="lg"
              className="group bg-background text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <Stack gap="sm" align="center">
                <span className="rounded-full p-1 ring-2 ring-brand-gold/40 transition-colors group-hover:ring-brand-gold">
                  <Avatar
                    src={member.avatarUrl}
                    alt={member.avatarAlt ?? member.name}
                    fallback={member.name.slice(0, 1)}
                    size="lg"
                  />
                </span>
                <Stack gap="none" align="center">
                  <Text weight="semibold" className="font-heading">
                    {member.name}
                  </Text>
                  <Text variant="bodySm" color="muted">
                    {member.role}
                  </Text>
                </Stack>
              </Stack>
            </Card>
          ))}
        </Grid>
      </Stack>
    </Section>
  );
}
