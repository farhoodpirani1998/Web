/**
 * Page container.
 *
 * Sprint 1.6 scope: the single shared page-level wrapper for admin
 * pages — owns horizontal padding, responsive max-width, and vertical
 * rhythm between a page's sections. `AdminLayout`'s `<main>` no longer
 * applies its own padding/max-width (see Sprint 1.6 layout audit); each
 * page opts in by wrapping its content in `<PageContainer>` instead of
 * redefining this wrapper itself.
 */
import type { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {children}
    </div>
  );
}
