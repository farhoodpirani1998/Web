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
 *
 * Visual refresh: cards move from a compact horizontal row to a
 * centered, `elevated` profile-card layout — larger avatar with a gold
 * ring, name/role stacked underneath — the same "portrait card" shape
 * premium team sections use, plus the hover lift already established
 * by `GalleryCard`/`NewsCard`/`AboutStats`/`AboutValues` for a
 * consistent card language across the page.
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
                  <Avatar alt={member.name} fallback={member.name.slice(0, 1)} size="lg" />
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
