import { useMemo, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { PermissionGate } from "@/components/ui/PermissionGate";
import { Section } from "@/components/ui/Section";
import { downloadNewsletterCsv } from "./api";
import { useNewsletterSubscribers } from "./hooks/useNewsletterSubscribers";

function formatPersianDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function NewsletterSubscribersPage() {
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [actionError, setActionError] = useState("");
  const filters = useMemo(
    () => ({
      search: search.trim() || undefined,
      from: from || undefined,
      to: to || undefined,
    }),
    [search, from, to],
  );
  const { subscribers, stats, isLoading, error, remove } =
    useNewsletterSubscribers(filters);

  async function exportCsv() {
    try {
      const blob = await downloadNewsletterCsv(filters);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "newsletter-subscribers.csv";
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setActionError("دریافت فایل انجام نشد. دوباره تلاش کنید.");
    }
  }

  async function deleteSubscriber(id: string, email: string) {
    if (!window.confirm(`مشترک ${email} حذف شود؟`)) return;
    setActionError("");
    try {
      await remove.mutateAsync(id);
    } catch {
      setActionError("حذف مشترک انجام نشد. دوباره تلاش کنید.");
    }
  }

  return (
    <PageContainer>
      <Breadcrumb items={[{ label: "داشبورد" }, { label: "مشترکان خبرنامه" }]} />
      <PermissionGate
        permission="website.newsletter:manage"
        fallback={
          <>
            <PageHeader title="مشترکان خبرنامه" />
            <Section>
              <EmptyState
                title="به مشترکان خبرنامه دسترسی ندارید"
                description="مشاهده و مدیریت فهرست ایمیل‌ها نیازمند مجوز جداگانه است."
              />
            </Section>
          </>
        }
      >
        <PageHeader
          title="مشترکان خبرنامه"
          description="مدیریت ایمیل‌های ثبت‌شده برای دریافت خبرنامه."
        />
        <Section>
          <div className="space-y-5">
            {stats ? (
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["کل مشترکان", stats.total],
                  ["عضویت امروز", stats.today],
                  ["عضویت این ماه", stats.thisMonth],
                ].map(([label, count]) => (
                  <div key={label} className="rounded-lg border bg-card p-4">
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="mt-1 text-2xl font-semibold">{count}</p>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="جستجو بر اساس ایمیل"
                aria-label="جستجوی مشترکان خبرنامه"
                className="rounded-md border bg-background px-3 py-2 text-sm"
              />
              <label className="flex items-center gap-2 text-sm">
                از تاریخ
                <input
                  type="date"
                  value={from}
                  onChange={(event) => setFrom(event.target.value)}
                  aria-label="از تاریخ عضویت"
                  className="min-w-0 flex-1 rounded-md border bg-background px-2 py-2"
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                تا تاریخ
                <input
                  type="date"
                  value={to}
                  onChange={(event) => setTo(event.target.value)}
                  aria-label="تا تاریخ عضویت"
                  className="min-w-0 flex-1 rounded-md border bg-background px-2 py-2"
                />
              </label>
              <Button variant="outline" onClick={() => void exportCsv()}>
                <Download size={16} />
                خروجی CSV
              </Button>
            </div>
            {actionError ? (
              <p role="alert" className="text-sm text-red-600">
                {actionError}
              </p>
            ) : null}
            {error ? (
              <EmptyState title="خطا در دریافت اطلاعات" description={error.message} />
            ) : isLoading ? (
              <p role="status" className="py-8 text-center text-sm text-muted-foreground">
                در حال بارگذاری…
              </p>
            ) : subscribers.length === 0 ? (
              <EmptyState
                title="مشترکی یافت نشد"
                description="برای فیلترهای انتخاب‌شده عضوی ثبت نشده است."
              />
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-right">
                    <tr>
                      <th className="px-4 py-3 font-medium">ایمیل</th>
                      <th className="px-4 py-3 font-medium">تاریخ عضویت</th>
                      <th className="px-4 py-3 font-medium">عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((subscriber) => (
                      <tr key={subscriber.id} className="border-t">
                        <td className="px-4 py-3" dir="ltr">
                          {subscriber.email}
                        </td>
                        <td className="px-4 py-3">
                          {formatPersianDate(subscriber.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={remove.isPending}
                            aria-label={`حذف ${subscriber.email}`}
                            onClick={() =>
                              void deleteSubscriber(subscriber.id, subscriber.email)
                            }
                          >
                            <Trash2 size={16} className="text-red-600" />
                            حذف
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Section>
      </PermissionGate>
    </PageContainer>
  );
}
