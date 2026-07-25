/**
 * Content page.
 *
 * Sprint 1.5 scope: placeholder only, rendered inside AdminLayout via
 * the `/admin/content` route. No CMS logic, no data — that is planned
 * for a later sprint.
 *
 * Sprint 1.6 scope: adopts the standardized admin page structure
 * (PageContainer > Breadcrumb > PageHeader > Section) established in
 * this sprint. Still no real content.
 */
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";

export function ContentPage() {
  return (
    <PageContainer>
      <Breadcrumb items={[{ label: "Dashboard" }, { label: "Content" }]} />

      <PageHeader
        title="Content"
        description="This is a placeholder for the Content section."
      />

      <Section>
        <EmptyState
          title="No content yet"
          description="Content management will be added in a later sprint."
        />
      </Section>
    </PageContainer>
  );
}
