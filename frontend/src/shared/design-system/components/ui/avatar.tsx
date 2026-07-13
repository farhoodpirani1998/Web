import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/shared/utils/cn";

/**
 * Content-agnostic avatar primitive (§12, §13). Mirrors shadcn/ui's
 * `Avatar`/`AvatarImage`/`AvatarFallback` composition, but is
 * implemented directly on `<img onError>` rather than pulling in
 * `@radix-ui/react-avatar` — the load-failure behavior it provides is a
 * few lines and doesn't warrant a new dependency for this Sprint.
 */
const avatarVariants = cva(
  "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted",
  {
    variants: {
      size: {
        sm: "h-8 w-8 text-xs",
        default: "h-10 w-10 text-sm",
        lg: "h-14 w-14 text-base",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof avatarVariants> {
  /** Image source. Omit (or let it fail to load) to show `fallback`. */
  src?: string;
  /** Required even when `src` is present, for the failed-load case. */
  alt: string;
  /** Initials or icon shown when `src` is absent or fails to load. */
  fallback?: React.ReactNode;
}

const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, size, src, alt, fallback, ...props }, ref) => {
    const [imageFailed, setImageFailed] = React.useState(false);
    const showImage = Boolean(src) && !imageFailed;

    return (
      <span ref={ref} className={cn(avatarVariants({ size, className }))} {...props}>
        {showImage ? (
          // eslint-disable-next-line jsx-a11y/alt-text -- alt is a required prop, always provided
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="font-medium uppercase text-muted-foreground" aria-hidden="true">
            {fallback}
          </span>
        )}
        {!showImage && <span className="sr-only">{alt}</span>}
      </span>
    );
  },
);
Avatar.displayName = "Avatar";

export { Avatar, avatarVariants };
