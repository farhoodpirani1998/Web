import { Avatar, Card, Grid, Heading, Section, Stack, Text } from "@/shared/design-system/components";
import { useAboutPage } from "./useAboutPage";
import type { AboutTeamMember } from "./types";

/**
 * About page "Team" section, following the same pattern as the
 * homepage's `hero`/`features`/`cta` features and now (as of this
 * extension) also `@/features/news`'s `NewsList`.
 *
 * Backed by `useAboutPage()` (the Public API's Static Pages/About
 * content module, §4, §8): lays out `data.team` once the query has
 * resolved with at least one item, and falls back to the local
 * `fallbackTeam` literal while the query is loading, has errored, or
 * the CMS has nothing published yet. `Avatar`'s own `src`/`fallback`
 * handling (§ its file's doc comment) covers members without a photo
 * — no extra branching needed here.
 *
 * Visual refresh: cards move from a compact horizontal row to a
 * centered, `elevated` profile-card layout — larger avatar with a gold
 * ring, name/role stacked underneath — the same "portrait card" shape
 * premium team sections use, plus the hover lift already established
 * by `GalleryCard`/`NewsCard`/`AboutStats`/`AboutValues` for a
 * consistent card language across the page.
 */

const fallbackTeam: readonly AboutTeamMember[] = [
  { id: "p1", name: "نام و نام‌خانوادگی نمونه", role: "مدیر آموزشی" },
  { id: "p2", name: "نام و نام‌خانوادگی نمونه", role: "سرپرست گروه علمی" },
  { id: "p3", name: "نام و نام‌خانوادگی نمونه", role: "مسئول امور دانش‌آموزی" },
];

export function AboutTeam() {
  const { data } = useAboutPage();
  const team = data && data.team.length > 0 ? data.team : fallbackTeam;

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
                  <Avatar
                    src={member.avatarUrl}
                    alt={member.name}
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
