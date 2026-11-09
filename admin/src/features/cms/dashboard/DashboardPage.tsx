import {
  Activity,
  ArrowLeft,
  BookOpen,
  CircleHelp,
  FileText,
  Newspaper,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { PageContainer } from "@/components/ui/PageContainer";
import { Section } from "@/components/ui/Section";
import { DashboardKpiCard } from "@/features/cms/dashboard/DashboardKpiCard";
import { DashboardContentCompleteness } from "@/features/cms/dashboard/DashboardContentCompleteness";
import { DashboardQuickActions } from "@/features/cms/dashboard/DashboardQuickActions";
import { DashboardRecentActivity } from "@/features/cms/dashboard/DashboardRecentActivity";
import { useDashboardStats } from "@/features/cms/dashboard/hooks/useDashboardStats";
import { formatLongDate } from "@/lib/formatDate";
import { formatNumber } from "@/lib/formatNumber";
import { ROUTE_PATHS } from "@/routes/paths";

export function DashboardPage() {
  const { stats, isLoading, error } = useDashboardStats();
  const chartItems = [
    {
      label: "صفحات منتشرشده",
      value: stats.publishedPagesCount,
      icon: FileText,
      color: "bg-primary",
    },
    {
      label: "اخبار منتشرشده",
      value: stats.publishedNewsCount,
      icon: Newspaper,
      color: "bg-brand-gold",
    },
    {
      label: "پرسش‌های متداول",
      value: stats.faqCount,
      icon: CircleHelp,
      color: "bg-sky-500",
    },
    {
      label: "پیش‌ثبت‌نام‌های جدید",
      value: stats.newPreRegistrationsCount,
      icon: Activity,
      color: "bg-emerald-500",
    },
  ];
  const availableValues = chartItems.flatMap((item) =>
    item.value === null ? [] : [item.value],
  );
  const chartMax = Math.max(...availableValues, 1);

  return (
    <PageContainer>
      <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F2D52] via-[#163e68] to-[#1d5276] px-5 py-7 text-white shadow-xl shadow-primary/10 sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -end-10 -top-24 -z-10 h-64 w-64 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -end-2 -top-16 -z-10 h-48 w-48 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -bottom-28 start-1/4 -z-10 h-56 w-56 rounded-full bg-brand-gold/10 blur-2xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-white/70">{formatLongDate()}</p>
            <h2 className="mt-2 font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">
              نمای کلی مدیریت محتوا
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-7 text-white/75">
              وضعیت واقعی محتوا و فعالیت‌های اخیر مجموعه در یک نگاه.
            </p>
          </div>
          <Link
            to={ROUTE_PATHS.ADMIN_PAGES}
            className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl bg-white/10 px-4 text-sm font-semibold text-white ring-1 ring-inset ring-white/20 transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold sm:self-auto"
          >
            رفتن به مدیریت محتوا
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <Section
        title="آمار کلیدی"
        description="داده‌ها مستقیماً از ماژول‌های پنل دریافت می‌شوند."
      >
        {error ? (
          <p
            role="alert"
            className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {error.message}؛ مقادیر ناموجود به‌صورت خط تیره نمایش داده می‌شوند.
          </p>
        ) : null}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
            accent="gold"
          />
          <DashboardKpiCard
            label="پرسش‌های متداول"
            value={stats.faqCount}
            isLoading={isLoading}
            icon={CircleHelp}
            accent="sky"
          />
          <DashboardKpiCard
            label="پیش‌ثبت‌نام‌های جدید"
            value={stats.newPreRegistrationsCount}
            isLoading={isLoading}
            icon={Activity}
            accent="emerald"
          />
        </div>
      </Section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
        <Card className="overflow-hidden rounded-2xl">
          <CardHeader className="border-b border-border/70 bg-card/60 px-5 py-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-5 w-5 text-brand-gold" aria-hidden="true" />
              نمای محتوای ثبت‌شده
            </CardTitle>
            <CardDescription>
              مقایسهٔ تعداد موارد ثبت‌شده در بخش‌های قابل‌اندازه‌گیری
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 px-5 py-5 sm:px-6">
            {isLoading ? (
              <div className="space-y-5" aria-label="در حال بارگذاری نمودار">
                {chartItems.map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                    <div className="h-2.5 w-full animate-pulse rounded-full bg-muted" />
                  </div>
                ))}
              </div>
            ) : availableValues.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
                <p className="text-sm font-medium text-foreground">
                  آماری برای نمایش در دسترس نیست
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  پس از برقراری دسترسی به داده‌ها، نمودار اینجا نمایش داده می‌شود.
                </p>
              </div>
            ) : (
              <div role="img" aria-label="نمودار تعداد محتوای ثبت‌شده در ماژول‌های پنل">
                {chartItems.map((item) => {
                  const Icon = item.icon;
                  const ratio = item.value === null ? 0 : (item.value / chartMax) * 100;
                  return (
                    <div key={item.label} className="mb-5 last:mb-0">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                          <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                          <span className="truncate">{item.label}</span>
                        </span>
                        <span className="shrink-0 text-sm font-bold tabular-nums text-foreground">
                          {item.value === null ? "—" : formatNumber(item.value)}
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
                        <div
                          className={`h-full rounded-full transition-[width] duration-700 ease-out ${item.color}`}
                          style={{ width: `${ratio}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <DashboardContentCompleteness />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
        <Card className="rounded-2xl">
          <CardHeader className="px-5 pb-3 pt-5 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-5 w-5 text-brand-gold" aria-hidden="true" />
              فعالیت‌های اخیر
            </CardTitle>
            <CardDescription>آخرین تغییرات ثبت‌شده در سامانه</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5 sm:px-6">
            <DashboardRecentActivity />
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="px-5 pb-3 pt-5">
            <CardTitle className="text-base">دسترسی سریع</CardTitle>
            <CardDescription>پرکاربردترین بخش‌های مدیریت</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <DashboardQuickActions />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
