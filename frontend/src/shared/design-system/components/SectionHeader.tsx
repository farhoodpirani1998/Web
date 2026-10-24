import * as React from "react";

import { Heading } from "@/shared/design-system/components/Heading";
import { Stack } from "@/shared/design-system/components/Stack";
import { Text } from "@/shared/design-system/components/Text";
import { Eyebrow } from "@/shared/design-system/components/Eyebrow";
import { cn } from "@/shared/utils/cn";

export interface SectionHeaderProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "start" | "center";
  headingLevel?: 1 | 2 | 3;
  /** Forwarded to `Heading` so the owning `<Section>` can label itself. */
  headingId?: string;
  onDark?: boolean;
  className?: string;
}

/**
 * Title block shared by every page hero and content section: eyebrow →
 * heading → gold rule → lead description.
 *
 * Deliberately does *not* own a trailing "view all" action — a section
 * that needs one composes `Stack direction="row" justify="between"`
 * around this (see `HomeNews`), which keeps the header presentational.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "start",
  headingLevel = 2,
  headingId,
  onDark = false,
  className,
}: SectionHeaderProps) {
  const centered = align === "center";

  return (
    <Stack
      gap={centered ? "sm" : "xs"}
      align={centered ? "center" : "start"}
      className={cn(centered && "text-center", className)}
    >
      {eyebrow ? <Eyebrow onDark={onDark}>{eyebrow}</Eyebrow> : null}

      <Stack gap="xs" align={centered ? "center" : "start"}>
        <Heading
          id={headingId}
          level={headingLevel}
          className={cn(onDark && "text-white")}
        >
          {title}
        </Heading>
        <span
          aria-hidden="true"
          className={cn(
            "block h-1 w-16 rounded-full",
            onDark ? "bg-white/70" : "bg-brand-gold",
          )}
        />
      </Stack>

      {description ? (
        <Text
          variant="lead"
          className={cn("max-w-2xl", onDark ? "text-white/75" : "text-foreground/70")}
        >
          {description}
        </Text>
      ) : null}
    </Stack>
  );
}
