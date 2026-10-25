import { CircleHelp, ClipboardList, FileText, Newspaper, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/ui/PageContainer";
import { PermissionGate } from "@/components/ui/PermissionGate";
import { Section } from "@/components/ui/Section";
import { useAuth } from "@/features/auth";

import { DashboardKpiCard } from "./DashboardKpiCard";
import { DashboardPreRegistrationWidget } from "./DashboardPreRegistrationWidget";
import { DashboardQuickActions } from "./DashboardQuickActions";
import { DashboardRecentActivity } from "./DashboardRecentActivity";
import { formatLongDate } from "@/lib/formatDate";
import { useDashboardStats } from "./hooks/useDashboardStats";

/**
 * The Admin Dashboard page (`/admin/dashboard`, wired via
 * `pages/DashboardPage.tsx` — same "feature-owned UI, page file just
 * re-exports it" convention every other CMS module follows).
 *
 * Composes a greeting strip, KPI cards, quick actions, a Recent Activity
 * timeline (backed by the Audit Log endpoint), and a Pre-Registration
 * callout — all from existing data hooks. The KPI cards, Pre-Registration
 * widget, and Recent Activity are gated behind `website.content:read` as
 * a group (every count reads from a `content:read`-gated list endpoint);
 * Quick Actions stays outside the gate since it's plain navigation.
 */
export function DashboardPage() {
  const { stats, isLoading, error, refetch } = useDashboardStats();
  const { admin } = useAuth();

  return (
    <PageContainer>
      <HeroStrip email={admin?.email ?? null} />

      <Section title="دسترسی سریع">
        <DashboardQuickActions />
      </Section>

      <PermissionGate
        permission="website.content:read"
        fallback={
          <Section>
            <EmptyState
              title="به داده‌های داشبورد دسترسی ندارید"
              description="مشاهده آمار داشبورد نیازمند دسترسی محتوا است. در صورت نیاز با مدیر تماس بگیرید."
            />
          </Section>
        }
      >
        <Section title="نمای کلی" description="خلاصه‌ای از وضعیت محتوای سایت.">
          {error ? (
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <p role="alert" className="text-sm text-destructive">
                {error.message}
              </p>
              <Button variant="outline" size="sm" onClick={refetch}>
                تلاش مجدد
              </Button>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DashboardKpiCard
              label="صفحات منتشرشده"
              value={stats.publishedPagesCount}
              isLoading={isLoading}
              icon={FileText}
              accent="navy"
            />
            <DashboardKpiCard
              label="اخبار منتشرشده"
              value={stats.publishedNewsCount}
              isLoading={isLoading}
              icon={Newspaper}
              accent="sky"
            />
            <DashboardKpiCard
              label="پیش‌ثبت‌نام‌های جدید"
              value={stats.newPreRegistrationsCount}
              isLoading={isLoading}
              icon={ClipboardList}
              accent="gold"
            />
            <DashboardKpiCard
              label="پرسش‌های متداول"
              value={stats.faqCount}
              isLoading={isLoading}
              icon={CircleHelp}
              accent="emerald"
            />
          </div>
        </Section>

        <Section title="پیش‌ثبت‌نام‌ها">
          <DashboardPreRegistrationWidget
            count={stats.newPreRegistrationsCount}
            isLoading={isLoading}
          />
        </Section>

        <Section title="فعالیت‌های اخیر">
          <DashboardRecentActivity />
        </Section>
      </PermissionGate>
    </PageContainer>
  );
}

/**
 * Greeting strip at the top of the Dashboard: a warm welcome, today's
 * Persian date, and a decorative brand icon. Purely presentational.
 */
function HeroStrip({ email }: { email: string | null }) {
  const name = email ? email.split("@")[0] : null;

  return (
    <div className="relative overflow-hidden rounded-lg border border-primary/15 bg-gradient-to-l from-primary to-[hsl(213_69%_15%)] p-6 text-white shadow-card">
      <div className="bg-dot-grid absolute inset-0 opacity-[0.15]" aria-hidden="true" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-white/70">{formatLongDate()}</p>
          <h2 className="mt-1 font-heading text-2xl font-extrabold">
            {name ? `خوش آمدید، ${name}` : "خوش آمدید"}
          </h2>
          <p className="mt-1 text-sm text-white/70">نمای کلی محتوای وب‌سایت در یک نگاه.</p>
        </div>
        <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-brand-gold sm:flex">
          <Sparkles className="h-7 w-7" />
        </span>
      </div>
    </div>
  );
}
