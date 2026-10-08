/**
 * Content module directory. The actual CRUD workflows live in their
 * own feature pages; this page provides one index into those modules.
 */
import { Link } from "react-router-dom";

import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { ADMIN_NAV_ITEMS } from "@/routes/nav.config";

const CONTENT_MODULES = ADMIN_NAV_ITEMS.filter(
  ({ id }) => !["dashboard", "content", "media", "settings"].includes(id),
);

export function ContentPage() {
  return (
    <PageContainer>
      <Breadcrumb items={[{ label: "Dashboard" }, { label: "Content" }]} />

      <PageHeader
        title="Content"
        description="Open a module to manage its published website content."
      />

      <Section>
        <nav aria-label="Content modules">
          <ul className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
            {CONTENT_MODULES.map((module) => (
              <li key={module.id} className="border-b border-slate-200">
                <Link
                  to={module.route}
                  className="flex min-h-12 items-center justify-between gap-3 py-3 text-sm font-medium text-slate-700 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
                >
                  {module.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Section>
    </PageContainer>
  );
}
