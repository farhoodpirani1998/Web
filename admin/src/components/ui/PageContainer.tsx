/**
 * Page container.
 *
 * Shared page-level wrapper for admin pages, providing horizontal
 * padding, responsive max-width, and vertical spacing between sections.
 * `AdminLayout` leaves page sizing to this component.
 */
import type { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {children}
    </div>
  );
}
