import { useState } from "react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { PermissionGate } from "@/components/ui/PermissionGate";
import { Section } from "@/components/ui/Section";
import { ApiError } from "@/lib/apiError";
import { useContactMessages } from "./hooks/useContactMessages";
import type { ContactMessage, ContactMessageStatus } from "./types";

const SUBJECT_LABELS: Record<ContactMessage["subject"], string> = {
  "educational-consultation": "مشاورهٔ آموزشی",
  "course-information": "اطلاعات دوره‌ها",
  "group-collaboration": "همکاری با گروه",
  other: "سایر پرسش‌ها",
};

const STATUS_LABELS: Record<ContactMessageStatus, string> = {
  new: "جدید",
  contacted: "پیگیری‌شده",
  closed: "بسته‌شده",
};

function isContactMessageStatus(value: string): value is ContactMessageStatus {
  return value === "new" || value === "contacted" || value === "closed";
}

function formatPersianDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function ContactMessagesPage() {
  const { messages, isLoading, error, updateStatus, remove } = useContactMessages();
  const [actionError, setActionError] = useState("");

  async function changeStatus(id: string, status: ContactMessageStatus) {
    setActionError("");
    try {
      await updateStatus.mutateAsync({ id, status });
    } catch (error) {
      setActionError(
        error instanceof ApiError ? error.message : "به‌روزرسانی وضعیت انجام نشد.",
      );
    }
  }

  async function deleteMessage(message: ContactMessage) {
    if (!window.confirm(`پیام ${message.fullName} حذف شود؟`)) return;
    setActionError("");
    try {
      await remove.mutateAsync(message.id);
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : "حذف پیام انجام نشد.");
    }
  }

  return (
    <PageContainer>
      <Breadcrumb items={[{ label: "داشبورد" }, { label: "پیام‌های تماس" }]} />
      <PermissionGate
        permission="website.content:read"
        fallback={
          <>
            <PageHeader title="پیام‌های تماس" />
            <Section>
              <EmptyState
                title="به پیام‌های تماس دسترسی ندارید"
                description="مشاهدهٔ این پیام‌ها نیازمند دسترسی محتوا است."
              />
            </Section>
          </>
        }
      >
        <PageHeader
          title="پیام‌های تماس"
          description="پیام‌های دریافتی فرم تماس را بررسی و پیگیری کنید."
        />
        <Section>
          <div className="space-y-4">
            {actionError ? (
              <p role="alert" className="text-sm text-red-600">
                {actionError}
              </p>
            ) : null}
            {error ? (
              <EmptyState title="خطا در دریافت پیام‌ها" description={error.message} />
            ) : isLoading ? (
              <p role="status" className="py-8 text-center text-sm text-muted-foreground">
                در حال بارگذاری پیام‌ها…
              </p>
            ) : messages.length === 0 ? (
              <EmptyState
                title="پیامی ثبت نشده است"
                description="پیام‌های جدید فرم تماس در این بخش نمایش داده می‌شوند."
              />
            ) : (
              messages.map((message) => (
                <article key={message.id} className="rounded-xl border bg-card p-5">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="min-w-0 space-y-2">
                      <h2 className="font-semibold">{message.fullName}</h2>
                      <a
                        href={`tel:${message.phone}`}
                        dir="ltr"
                        className="inline-block text-sm text-primary hover:underline"
                      >
                        {message.phone}
                      </a>
                      <p className="text-sm text-muted-foreground">
                        {SUBJECT_LABELS[message.subject]} ·{" "}
                        {formatPersianDate(message.createdAt)}
                      </p>
                    </div>
                    <PermissionGate
                      permission="website.content:write"
                      fallback={
                        <span className="text-sm text-muted-foreground">
                          وضعیت: {STATUS_LABELS[message.status]}
                        </span>
                      }
                    >
                      <label className="flex items-center gap-2 text-sm">
                        وضعیت
                        <select
                          aria-label={`وضعیت پیام ${message.fullName}`}
                          value={message.status}
                          disabled={updateStatus.isPending}
                          onChange={(event) => {
                            if (isContactMessageStatus(event.target.value)) {
                              void changeStatus(message.id, event.target.value);
                            }
                          }}
                          className="rounded-md border bg-background px-3 py-2"
                        >
                          {Object.entries(STATUS_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </PermissionGate>
                  </div>
                  <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7">
                    {message.message}
                  </p>
                  <PermissionGate permission="website.content:write">
                    <div className="mt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={remove.isPending}
                        onClick={() => void deleteMessage(message)}
                      >
                        حذف پیام
                      </Button>
                    </div>
                  </PermissionGate>
                </article>
              ))
            )}
          </div>
        </Section>
      </PermissionGate>
    </PageContainer>
  );
}
