import { Image as ImageIcon } from "lucide-react";
import * as React from "react";

import { AspectRatio } from "@/shared/design-system/components/AspectRatio";
import { Image } from "@/shared/design-system/components/Image";
import { Stack } from "@/shared/design-system/components/Stack";
import { Text } from "@/shared/design-system/components/Text";
import { cn } from "@/shared/utils/cn";

export interface MediaFrameProps {
  /** CMS-published image. Empty/undefined renders the branded placeholder. */
  src?: string | null;
  alt?: string;
  ratio?: number;
  /** Caption shown on the placeholder surface. */
  label?: string;
  icon?: React.ComponentType<{ className?: string }>;
  eager?: boolean;
  /** Classes for the outer frame (rounding, ring, shadow). */
  className?: string;
}

/**
 * Image slot with a brand-consistent empty state.
 *
 * The site has no real photography yet — CMS content modules supply
 * image URLs later. Rather than shipping fake photos, every visual slot
 * goes through this: a soft navy/gold gradient tile with a glyph until
 * `src` exists, then the real image with the exact same crop and
 * rounding. Swapping in production photos is a data change, not a
 * markup change.
 */
export function MediaFrame({
  src,
  alt = "",
  ratio = 16 / 9,
  label = "تصویر به‌زودی",
  icon: Icon = ImageIcon,
  eager = false,
  className,
}: MediaFrameProps) {
  return (
    <AspectRatio
      ratio={ratio}
      className={cn(
        "overflow-hidden bg-gradient-to-br from-brand-navy/10 via-muted to-brand-gold/15",
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fit="cover"
          loading={eager ? "eager" : "lazy"}
          className="absolute inset-0 transition-transform duration-500"
        />
      ) : (
        <Stack
          align="center"
          justify="center"
          gap="xs"
          className="absolute inset-0 px-2 text-center"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background/70 text-brand-navy/45 ring-1 ring-border/60">
            <Icon className="h-6 w-6" />
          </span>
          <Text variant="caption" color="muted">
            {label}
          </Text>
        </Stack>
      )}
    </AspectRatio>
  );
}
