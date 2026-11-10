import { apiClient } from "@/shared/api";
import { toPersianDigits } from "@/shared/utils/toPersianDigits";

import { parseAboutBody } from "./markdown";
import type { AboutPageContent, PublicAboutDto } from "./types";

const numberFormatter = new Intl.NumberFormat("fa-IR", {
  maximumFractionDigits: 2,
});
const indexFormatter = new Intl.NumberFormat("fa-IR", {
  minimumIntegerDigits: 2,
  useGrouping: false,
});

/**
 * Request functions for the `about` feature's Public API endpoint.
 *
 * Per §14/§30, this is the only file in the `about` feature aware of
 * the endpoint's URL — `useAboutPage` and any future consumer call
 * `fetchAboutPage`, never `apiClient` directly.
 *
 * The real endpoint (`GET /public/about`) returns a singleton object
 * (`{ title, body, image, sections, seo, structuredData, updatedAt }`), not the
 * `AboutPageContent` section shape the page's components render — see
 * `./types.ts`'s doc comment — so, same as `campuses`'s `fetchCampuses`
 * and `teachers`'s `fetchTeachers`, the response is adapted via
 * `toAboutPageContent` before it reaches any caller.
 */
export async function fetchAboutPage(): Promise<AboutPageContent> {
  const response = await apiClient.get<PublicAboutDto>("/about");
  return toAboutPageContent(response.data);
}

/**
 * Adapts the wire `PublicAboutDto` into the `AboutPageContent` shape
 * the About page and homepage sections render.
 *
 * The site currently renders Persian content, so each `Translatable`
 * field resolves `.fa` directly, same as `campuses`'s `toCampus` and
 * `teachers`'s `toTeacher`.
 *
 * `hero.description` and `story.blocks` are derived from the `body`
 * field; Markdown headings and emphasis are parsed as text-only blocks.
 *
 * `seo`/`structuredData` are the one pair of fields copied straight
 * through unchanged — `AboutPage` passes them to the shared `<Seo />`
 * component (`@/shared/seo`, §21) rather than any section component
 * rendering them.
 */
function toAboutPageContent(dto: PublicAboutDto): AboutPageContent {
  const title = dto.title.fa;
  const storyBlocks = parseAboutBody(dto.body?.fa ?? "");
  const leadParagraph =
    storyBlocks.find((block) => block.type === "paragraph")?.text ?? "";

  return {
    hero: {
      title,
      description: leadParagraph,
    },
    image: dto.image,
    stats: {
      title: dto.sections.stats.title?.fa,
      description: dto.sections.stats.description?.fa,
      items: dto.sections.stats.items.map((item) => ({
        id: item.id,
        value: numberFormatter.format(Number(item.value)),
        suffix: item.suffix,
        label: item.label.fa,
      })),
    },
    story: {
      title,
      blocks: storyBlocks,
    },
    values: {
      title: dto.sections.values.title?.fa,
      description: dto.sections.values.description?.fa,
      items: dto.sections.values.items.map((item, index) => ({
        id: item.id,
        index: indexFormatter.format(index + 1),
        title: item.title.fa,
        description: item.description.fa,
      })),
    },
    timeline: {
      title: dto.sections.timeline.title?.fa,
      description: dto.sections.timeline.description?.fa,
      items: dto.sections.timeline.items.map((item) => ({
        id: item.id,
        year: toPersianDigits(item.year),
        title: item.title.fa,
        description: item.description.fa,
      })),
    },
    team: {
      title: dto.sections.team.title?.fa,
      description: dto.sections.team.description?.fa,
      items: dto.sections.team.items.map((item) => ({
        id: item.id,
        name: item.name.fa,
        role: item.role.fa,
        avatarUrl: item.avatar?.url,
        avatarAlt: item.avatar?.altText,
      })),
    },
    faq: [],
    faqSection: {
      title: dto.sections.faq?.title?.fa,
      description: dto.sections.faq?.description?.fa,
    },
    seo: dto.seo,
    structuredData: dto.structuredData,
  };
}
