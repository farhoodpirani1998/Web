import { Activity, BookOpen, Users, Zap } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { PageContainer } from "@/components/ui/PageContainer";
import { Section } from "@/components/ui/Section";
import { formatLongDate } from "@/lib/formatDate";

export function DashboardPage() {
  return (
    <PageContainer>
      <HeroStrip />

      <Section title="وضعیت کلی" description="نمای کلی سیستم و محتوای سایت در یک نگاه.">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard />
          <RecentNewsCard />
          <ActiveUsersCard />
          <SystemStatusCard />
        </div>
      </Section>
    </PageContainer>
  );
}

function HeroStrip() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/15 bg-gradient-to-l from-[#0F2D52] to-[#1a4266] p-6 text-white shadow-card">
      <div className="bg-dot-grid absolute inset-0 opacity-[0.18]" aria-hidden="true" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-white/70">{formatLongDate()}</p>
          <h2 className="mt-1 font-heading text-2xl font-extrabold tracking-tight">داشبورد مدیریت</h2>
          <p className="mt-1 text-sm text-white/70">خلاصه آمار، اخبار تازه، کاربران فعال و وضعیت سیستم.</p>
        </div>
        <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-gold/20 text-brand-gold sm:flex">
          <Zap className="h-7 w-7" />
        </span>
      </div>
    </div>
  );
}

function StatsCard() {
  return (
    <Card interactive variant="elevated" className="shadow-brand border-brand-navy/20 bg-gradient-to-br from-[#0F2D52]/5 to-[#0F2D52]/[0.02]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-brand-navy">
          <BookOpen className="h-5 w-5 text-brand-gold" /> آمار محتوا
        </CardTitle>
        <CardDescription>صفحات منتشرشده و اخبار</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-[#0F2D52] p-3 text-white shadow-sm">
            <p className="text-xs text-white/70">صفحات</p>
            <p className="font-heading text-xl font-extrabold">128</p>
          </div>
          <div className="rounded-lg bg-brand-gold/10 p-3 text-brand-gold shadow-sm">
            <p className="text-xs text-brand-gold/70">اخبار</p>
            <p className="font-heading text-xl font-extrabold">34</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentNewsCard() {
  const items = [
    { title: "افتتاح مرکز آموزش جدید", time: "۲ ساعت پیش", tag: "اخبار" },
    { title: "به‌روزرسانی برنامه درسی", time: "۵ ساعت پیش", tag: "آموزش" },
    { title: "میزبان مسابقه ملی", time: "۱ روز پیش", tag: "رویداد" },
  ];
  return (
    <Card interactive variant="elevated" className="shadow-brand border-brand-gold/20 bg-gradient-to-br from-brand-gold/[0.08] to-brand-gold/[0.02]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-brand-navy">
          <Zap className="h-5 w-5 text-brand-gold" /> اخبار اخیر
        </CardTitle>
        <CardDescription>جدیدترین مطالب منتشرشده</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {items.map((n) => (
          <a
            key={n.title}
            href="#"
            className="group rounded-lg border border-border bg-card/60 p-3 transition-colors hover:border-brand-gold/40 hover:bg-card"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold leading-snug text-foreground group-hover:text-brand-navy">{n.title}</h4>
              <span className="mr-2 shrink-0 rounded-full bg-brand-navy px-2 py-0.5 text-[10px] font-bold text-white">{n.tag}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{n.time}</p>
          </a>
        ))}
      </CardContent>
    </Card>
  );
}

function ActiveUsersCard() {
  return (
    <Card interactive variant="elevated" className="shadow-brand border-brand-navy/20 bg-gradient-to-br from-[#0F2D52]/5 to-[#0F2D52]/[0.02]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-brand-navy">
          <Users className="h-5 w-5 text-brand-gold" /> کاربران فعال
        </CardTitle>
        <CardDescription>جلسات و دسترسی هم‌زمان</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-3">
          <div className="rounded-xl bg-[#0F2D52] px-4 py-3 text-white shadow-sm">
            <p className="text-xs text-white/70">آنلاین اکنون</p>
            <p className="font-heading text-3xl font-extrabold leading-none">42</p>
          </div>
          <div className="rounded-xl bg-brand-gold/10 px-4 py-3 text-brand-gold shadow-sm">
            <p className="text-xs text-brand-gold/70">کل امروز</p>
            <p className="font-heading text-3xl font-extrabold leading-none">312</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SystemStatusCard() {
  return (
    <Card interactive variant="elevated" className="shadow-brand border-brand-gold/20 bg-gradient-to-br from-emerald-50 to-emerald-50/40 dark:from-emerald-950/20 dark:to-emerald-950/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-brand-navy">
          <Activity className="h-5 w-5 text-emerald-600" /> وضعیت سیستم
        </CardTitle>
        <CardDescription>سلامت سرویس‌ها</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {[
            { label: "سرور اصلی", status: "فعال", ok: true },
            { label: "پایگاه داده", status: "فعال", ok: true },
            { label: "API محتوا", status: "فعال", ok: true },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
              <span className="text-sm font-medium">{s.label}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${s.ok ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{s.status}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
