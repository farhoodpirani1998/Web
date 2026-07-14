import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { AspectRatio } from "@/shared/design-system/components/AspectRatio";
import { Skeleton } from "@/shared/design-system/components/ui/skeleton";
import { cn } from "@/shared/utils/cn";

const imageVariants = cva("h-full w-full", {
  variants: {
    fit: {
      cover: "object-cover",
      contain: "object-contain",
      fill: "object-fill",
    },
  },
  defaultVariants: {
    fit: "cover",
  },
});

export interface ImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "alt">,
    VariantProps<typeof imageVariants> {
  alt: string;
  /** Constrains the image to a ratio via `AspectRatio`. Omit to size naturally. */
  ratio?: number;
  /** Shown in place of the image (inside the same box) if it fails to load. */
  fallback?: React.ReactNode;
  containerClassName?: string;
}

/**
 * Content-agnostic image primitive (§12, §13). Composes Sprint 2A/2B
 * primitives instead of reimplementing them: `AspectRatio` for the box,
 * `Skeleton` for the loading placeholder. Always `loading="lazy"` and
 * `decoding="async"` unless the caller overrides them (e.g. an
 * above-the-fold hero image supplying `loading="eager"`).
 */
const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      ratio,
      fit,
      fallback,
      className,
      containerClassName,
      loading = "lazy",
      decoding = "async",
      onLoad,
      onError,
      ...props
    },
    ref,
  ) => {
    const [status, setStatus] = React.useState<"loading" | "loaded" | "error">("loading");

    const content = (
      <>
        {status === "loading" && (
          <Skeleton className="absolute inset-0 h-full w-full" shape="rect" />
        )}
        {status === "error" ? (
          fallback ?? (
            <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
              Image unavailable
            </div>
          )
        ) : (
          <img
            ref={ref}
            loading={loading}
            decoding={decoding}
            className={cn(
              imageVariants({ fit, className }),
              status === "loading" && "opacity-0",
            )}
            onLoad={(event) => {
              setStatus("loaded");
              onLoad?.(event);
            }}
            onError={(event) => {
              setStatus("error");
              onError?.(event);
            }}
            {...props}
          />
        )}
      </>
    );

    if (ratio) {
      return (
        <AspectRatio ratio={ratio} className={containerClassName}>
          {content}
        </AspectRatio>
      );
    }

    return (
      <div className={cn("relative", containerClassName)}>{content}</div>
    );
  },
);
Image.displayName = "Image";

export { Image, imageVariants };
