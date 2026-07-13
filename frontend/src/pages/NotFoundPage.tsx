import { Link } from "react-router-dom";

import { Button } from "@/shared/design-system/components";

/**
 * From the frontend's perspective, a genuinely missing slug and a slug
 * belonging to a currently-disabled section are the same outcome —
 * absent data (§7, §10, §18) — so both resolve here.
 */
export function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-heading text-sm font-semibold uppercase tracking-wide text-secondary">
        404
      </p>
      <h1 className="font-heading text-3xl font-semibold text-foreground">
        Page not found
      </h1>
      <p className="max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or is currently
        unavailable.
      </p>
      <Button asChild>
        <Link to="/">Back to homepage</Link>
      </Button>
    </div>
  );
}
