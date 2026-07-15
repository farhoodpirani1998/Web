import { Link as RouterLink } from "react-router-dom";

import { Button, Heading, PageLayout, Stack, Text } from "@/shared/design-system/components";

/**
 * From the frontend's perspective, a genuinely missing slug and a slug
 * belonging to a currently-disabled section are the same outcome —
 * absent data (§7, §10, §18) — so both resolve here.
 *
 * Sprint 3B updates this page to compose inside `PageLayout`, matching
 * every other route, instead of hand-rolling its own wrapper.
 */
export function NotFoundPage() {
  return (
    <PageLayout>
      <Stack gap="md" align="center" className="min-h-[60vh] justify-center text-center">
        <Text variant="overline" color="primary">
          404
        </Text>
        <Heading level={1}>Page not found</Heading>
        <Text color="muted" className="max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or is currently
          unavailable.
        </Text>
        <Button asChild>
          <RouterLink to="/">Back to homepage</RouterLink>
        </Button>
      </Stack>
    </PageLayout>
  );
}
