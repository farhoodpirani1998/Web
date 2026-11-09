import {
  Heading,
  Section,
  SectionHeader,
  Stack,
  Text,
} from "@/shared/design-system/components";
import { renderAboutInline } from "./markdown";
import { useAboutPage } from "./useAboutPage";

export function AboutStory() {
  const { data } = useAboutPage();
  const story = data?.story;
  if (!story || story.blocks.length === 0) return null;
  const firstParagraphIndex = story.blocks.findIndex(
    (block) => block.type === "paragraph",
  );

  return (
    <Section spacing="lg" aria-labelledby="about-story-heading">
      <Stack gap="lg" className="max-w-4xl">
        <SectionHeader
          headingId="about-story-heading"
          eyebrow="روایت مجموعه"
          title={story.title}
        />

        {story.blocks.map((block, index) => {
          if (block.type === "heading") {
            const level = block.level === 1 ? 3 : block.level === 2 ? 4 : 5;
            return (
              <Heading key={index} level={level}>
                {renderAboutInline(block.text)}
              </Heading>
            );
          }

          const paragraph = (
            <Text
              key={index}
              variant={index === firstParagraphIndex ? "lead" : "body"}
              color={index === firstParagraphIndex ? "default" : "muted"}
              className={index === firstParagraphIndex ? "text-foreground/80" : undefined}
            >
              {renderAboutInline(block.text)}
            </Text>
          );

          return index === firstParagraphIndex ? (
            <div key={index} className="border-s-2 border-brand-gold/40 ps-5">
              {paragraph}
            </div>
          ) : (
            paragraph
          );
        })}
      </Stack>
    </Section>
  );
}
