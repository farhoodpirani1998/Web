import * as React from "react";

import {
  Container,
  type ContainerProps,
} from "@/shared/design-system/components/Container";
import { SectionHeader } from "@/shared/design-system/components/SectionHeader";
import { Stack } from "@/shared/design-system/components/Stack";
import { cn } from "@/shared/utils/cn";

export interface PageHeroProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Required: the `<section>` is labelled by this heading. */
  headingId: string;
  /** CTAs, rendered in a wrapping row under the description. */
  actions?: React.ReactNode;
  /** Right-hand visual — usually a `MediaFrame`. */
  media?: React.ReactNode;
  containerSize?: ContainerProps["size"];
  className?: string;
}

/**
 * Inner-page hero band — the light navy/gold counterpart of the
 * homepage `Hero`, and the single replacement for the ten near-identical
 * `*Hero` blocks that each feature had hand-rolled (`SchoolsHero`,
 * `NewsHero`, `ContactIntro`, `AboutHero`, `GalleryHero`, ...).
 *
 * Full-bleed by design, so a page must render it *outside* `PageLayout`
 * (which is a `Container`) — same rule the homepage follows for its
 * full-bleed sections.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  headingId,
  actions,
  media,
  containerSize = "xl",
  className,
}: PageHeroProps) {
  return (
    <section
      aria-labelledby={headingId}
      className={cn("relative isolate overflow-hidden bg-muted/50", className)}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -end-32 -top-32 h-80 w-80 rounded-full bg-brand-navy/[0.07] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -start-24 bottom-[-4rem] h-72 w-72 rounded-full bg-brand-gold/[0.12] blur-3xl"
      />

      <Container
        size={containerSize}
        className={cn(
          "relative z-10 grid gap-10 py-14 md:py-20 lg:items-center lg:gap-14",
          media && "lg:grid-cols-[minmax(0,1fr)_26rem]",
        )}
      >
        <div className="duration-700 animate-in fade-in slide-in-from-bottom-4">
          <SectionHeader
            eyebrow={eyebrow}
            title={title}
            description={description}
            headingId={headingId}
            headingLevel={1}
            className={media ? undefined : "max-w-3xl"}
          />
          {actions ? (
            <Stack direction="row" gap="sm" wrap className="mt-8">
              {actions}
            </Stack>
          ) : null}
        </div>

        {media ? (
          <div className="relative delay-150 duration-700 animate-in fade-in slide-in-from-bottom-4 fill-mode-both">
            {media}
          </div>
        ) : null}
      </Container>
    </section>
  );
}
