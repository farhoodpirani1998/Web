import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/cn";

/**
 * Avatar primitive. Implemented on `<img onError>` rather than pulling
 * in `@radix-ui/react-avatar` — the load-failure behavior is a couple of
 * lines and doesn't warrant another dependency.
 */
const avatarVariants = cva(
  "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary",
  {
    variants: {
      size: {
        sm: "h-8 w-8 text-xs",
        default: "h-9 w-9 text-sm",
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
  /** Image source. Omit (or let it fail) to show `fallback`. */
  src?: string;
  alt: string;
  /** Initials or icon shown when `src` is absent or fails to load. */
  fallback?: React.ReactNode;
}

const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, size, src, alt, fallback, ...props }, ref) => {
    const [imageFailed, setImageFailed] = React.useState(false);

    // Reset on `src` change so a later, valid source is attempted.
    React.useEffect(() => {
      setImageFailed(false);
    }, [src]);

    const showImage = Boolean(src) && !imageFailed;

    return (
      <span ref={ref} className={cn(avatarVariants({ size, className }))} {...props}>
        {showImage ? (
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span
            className="font-semibold uppercase text-secondary-foreground"
            aria-hidden="true"
          >
            {fallback}
          </span>
        )}
        {!showImage && <span className="sr-only">{alt}</span>}
      </span>
    );
  },
);
Avatar.displayName = "Avatar";

export { Avatar };
