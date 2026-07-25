import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { PermissionGate } from "@/components/ui/PermissionGate";
import { Section } from "@/components/ui/Section";

import { DashboardKpiCard } from "./DashboardKpiCard";
import { DashboardPreRegistrationWidget } from "./DashboardPreRegistrationWidget";
import { DashboardQuickActions } from "./DashboardQuickActions";
import { DashboardRecentActivity } from "./DashboardRecentActivity";
import { useDashboardStats } from "./hooks/useDashboardStats";

/**
 * The Admin Dashboard page (`/admin/dashboard`, wired via
 * `pages/DashboardPage.tsx` — same "feature-owned UI, page file just
 * re-exports it" convention every other CMS module follows).
 *
 * Sprint scope: KPI cards (Published Pages, Published News, New
 * Pre-Registrations, FAQ), Quick Actions links, a Recent Activity
 * section backed by the Audit Log endpoint (`features/cms/audit-log`),
 * and a Pre-Registration widget. Explicitly out of scope: analytics,
 * charts, notifications, and any change to the admin layout shell —
 * this page only composes the existing `PageContainer`/`PageHeader`/
 * `Section`/`EmptyState`/`PermissionGate` primitives, same as every
 * other admin page.
 *
 * The KPI cards, Pre-Registration widget, and Recent Activity section
 * are gated behind `website.content:read` as a group — same "entire
 * page body gated behind the read permission its data depends on"
 * convention `FaqPage`/`PagesPage`/`PreRegistrationsPage` use, since
 * every count here reads from a `content:read`-gated list endpoint.
 * Quick Actions stays outside the gate: it's plain navigation (see
 * `DashboardQuickActions`'s own comment), not data this permission
 * protects.
 */
export function DashboardPage() {
  const { stats, isLoading, error, refetch } = useDashboardStats();

  return (
    <PageContainer>
      <Breadcrumb items={[{ label: "Dashboard" }]} />

      <PageHeader title="Dashboard" description="Overview of the admin panel." />

      <Section title="Quick Actions">
        <DashboardQuickActions />
      </Section>

      <PermissionGate
        permission="website.content:read"
        fallback={
          <Section>
            <EmptyState
              title="You don't have access to dashboard data"
              description="Viewing dashboard statistics requires the Content permission. Contact an admin if you need access."
            />
          </Section>
        }
      >
        <Section title="Overview">
          {error ? (
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <p role="alert" className="text-sm text-red-600">
                {error.message}
              </p>
              <button
                type="button"
                onClick={refetch}
                className="rounded-md border border-slate-200 px-2 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Retry
              </button>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DashboardKpiCard
              label="Published Pages"
              value={stats.publishedPagesCount}
              isLoading={isLoading}
            />
            <DashboardKpiCard
              label="Published News"
              value={stats.publishedNewsCount}
              isLoading={isLoading}
            />
            <DashboardKpiCard
              label="New Pre-Registrations"
              value={stats.newPreRegistrationsCount}
              isLoading={isLoading}
            />
            <DashboardKpiCard label="FAQ" value={stats.faqCount} isLoading={isLoading} />
          </div>
        </Section>

        <Section title="Pre-Registrations">
          <DashboardPreRegistrationWidget
            count={stats.newPreRegistrationsCount}
            isLoading={isLoading}
          />
        </Section>

        <Section title="Recent Activity">
          <DashboardRecentActivity />
        </Section>
      </PermissionGate>
    </PageContainer>
  );
}
