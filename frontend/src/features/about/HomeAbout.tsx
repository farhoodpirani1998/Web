import { Check } from "lucide-react";

import {
  Container,
  Heading,
  Link,
  Stack,
  Text,
  buttonVariants,
} from "@/shared/design-system/components";
import { useCampuses } from "@/features/campuses";
import { cn } from "@/shared/utils/cn";
import { CampusGlobe } from "./CampusGlobe";
import { renderAboutInline } from "./markdown";
import { useAboutPage } from "./useAboutPage";

export function HomeAbout() {
  const { data, error, isLoading } = useAboutPage();
  const campusesQuery = useCampuses();

  if (isLoading) return null;

  if (error) {
    return (
      <Container size="xl" className="py-8">
        <p role="alert" className="text-sm text-destructive">
          بارگذاری معرفی مجموعه ناموفق بود: {error.message}
        </p>
      </Container>
    );
  }

  if (!data) return null;

  const { image, story, stats, values } = data;
  const paragraphs = story.blocks
    .filter((block) => block.type === "paragraph")
    .slice(0, 2);
  const hasContent =
    story.title.trim().length > 0 ||
    paragraphs.length > 0 ||
    Boolean(image) ||
    stats.items.length > 0 ||
    values.items.length > 0;

  if (!hasContent) return null;

  const featuredStat = stats.items[0];

  return (
    <section className="relative isolate overflow-hidden py-8 sm:py-12">
      <Container
        size="xl"
        dir="ltr"
        className="grid gap-12 py-16 sm:py-24 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-16"
      >
        <div
          dir="rtl"
          className="slide-in-from-start-8 relative duration-700 animate-in fade-in"
        >
          <CampusGlobe
            campuses={campusesQuery.data ?? []}
            isLoading={campusesQuery.isPending}
            hasError={campusesQuery.isError}
          />
        </div>

        <Stack
          gap="lg"
          align="start"
          dir="rtl"
          className="slide-in-from-end-8 duration-700 animate-in fade-in"
        >
          <Stack gap="xs" align="start">
            <div className="inline-flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-10 bg-accent" />
              <span className="text-xs font-bold text-accent">درباره ما</span>
            </div>
            {story.title ? <Heading level={2}>{story.title}</Heading> : null}
          </Stack>

          {paragraphs.map((paragraph, index) => (
            <Text key={index} color="muted">
              {renderAboutInline(paragraph.text)}
            </Text>
          ))}

          {values.items.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {values.items.map((item) => (
                <li key={item.id} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent"
                  >
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  <Stack gap="xs">
                    <Text as="span" variant="bodySm">
                      {item.title}
                    </Text>
                    {item.description ? (
                      <Text as="span" variant="caption" color="muted">
                        {item.description}
                      </Text>
                    ) : null}
                  </Stack>
                </li>
              ))}
            </ul>
          ) : null}

          {featuredStat ? (
            <div className="rounded-2xl border border-accent/20 bg-accent/5 px-5 py-4">
              <div className="text-3xl font-bold text-accent">
                {featuredStat.value}
                {featuredStat.suffix ?? ""}
              </div>
              <div className="mt-1 text-xs font-medium text-muted-foreground">
                {featuredStat.label}
              </div>
            </div>
          ) : null}

          <Link
            href="/about"
            className={cn(
              buttonVariants({ size: "lg" }),
              "rounded-full bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            مأموریت و چشم‌انداز ما
          </Link>
        </Stack>
      </Container>
    </section>
  );
}
