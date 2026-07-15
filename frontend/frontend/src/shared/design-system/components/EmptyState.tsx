import * as React from "react";

import { Button, type ButtonProps } from "@/shared/design-system/components/ui/button";
import { Heading } from "@/shared/design-system/components/Heading";
import { Stack } from "@/shared/design-system/components/Stack";
import { Text } from "@/shared/design-system/components/Text";
import { cn } from "@/shared/utils/cn";

export interface EmptyStateAction {
  label: string;
  onClick: ButtonProps["onClick"];
  variant?: ButtonProps["variant"];
}

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Decorative illustration or icon — rendered `aria-hidden`. */
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: EmptyStateAction;
}

/**
 * Content-agnostic "nothing here yet" primitive (§12, §13, §19),
 * composed entirely from Sprint 2A primitives (`Stack`, `Heading`,
 * `Text`, `Button`) — no new styling vocabulary introduced. A feature
 * supplies copy/an action; this component owns only the layout.
 */
const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, description, action, className, ...props }, ref) => (
    <Stack
      ref={ref}
      align="center"
      justify="center"
      gap="sm"
      className={cn("px-6 py-12 text-center", className)}
      {...props}
    >
      {icon && (
        <div className="text-muted-foreground" aria-hidden="true">
          {icon}
        </div>
      )}
      <Heading level={3} align="center">
        {title}
      </Heading>
      {description && (
        <Text variant="bodySm" color="muted" align="center" className="max-w-md">
          {description}
        </Text>
      )}
      {action && (
        <Button variant={action.variant ?? "outline"} onClick={action.onClick} className="mt-2">
          {action.label}
        </Button>
      )}
    </Stack>
  ),
);
EmptyState.displayName = "EmptyState";

export { EmptyState };
