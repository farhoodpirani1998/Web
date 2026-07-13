import { Avatar, Card, Grid, Heading, Section, Stack, Text } from "@/shared/design-system/components";

/**
 * About page "Team" section — extracted from `AboutPage`'s inline
 * markup without changing layout, styling, or content, following the
 * same pattern as the homepage's `hero`/`features`/`cta` features.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Grid`, `Card`, `Avatar`, `Heading`,
 * `Text`) — no data fetching, no business logic. Team members are
 * grouped into a local array literal rather than interleaved in JSX
 * (Website Frontend Architecture §4, §8), so the eventual swap to a
 * `useAboutPage()`-style data hook is a matter of replacing this
 * literal — the layout and design-system wiring below do not need to
 * change. Real names/roles/photos are ultimately Static Pages/About
 * content-module data; this renders frontend-owned Persian placeholder
 * copy in the meantime.
 */

const team = [
  { id: "p1", name: "نام و نام‌خانوادگی نمونه", role: "مدیر آموزشی" },
  { id: "p2", name: "نام و نام‌خانوادگی نمونه", role: "سرپرست گروه علمی" },
  { id: "p3", name: "نام و نام‌خانوادگی نمونه", role: "مسئول امور دانش‌آموزی" },
] as const;

export function AboutTeam() {
  return (
    <Section spacing="lg" aria-labelledby="about-team-heading">
      <Stack gap="md">
        <Stack gap="sm">
          <Heading id="about-team-heading" level={2}>
            اعضای تیم
          </Heading>
          <Text variant="lead" className="max-w-2xl">
            متن نمونه برای معرفی گروهی از افرادی که مسئولیت اداره مجموعه
            را بر عهده دارند. اسامی و تصاویر واقعی از طریق سامانه مدیریت
            محتوا تکمیل خواهد شد.
          </Text>
        </Stack>

        <Grid cols="3" gap="md">
          {team.map((member) => (
            <Card key={member.id} variant="outline" padding="md">
              <Stack direction="row" gap="sm" align="center">
                <Avatar alt={member.name} fallback={member.name.slice(0, 1)} size="lg" />
                <Stack gap="none">
                  <Text weight="semibold">{member.name}</Text>
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
