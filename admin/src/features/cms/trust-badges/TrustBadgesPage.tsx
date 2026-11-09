import { useState } from "react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { PermissionGate } from "@/components/ui/PermissionGate";
import { Section } from "@/components/ui/Section";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/apiError";
import {
  deleteTrustBadge,
  reorderTrustBadges,
  updateTrustBadgeStatus,
} from "./api";
import { TrustBadgeForm } from "./TrustBadgeForm";
import { TrustBadgeList } from "./TrustBadgeList";
import { trustBadgeKeys, useTrustBadges } from "./hooks/useTrustBadges";
import type { CmsTrustBadge, CmsTrustBadgeStatus } from "./types";

export function TrustBadgesPage() {
  const queryClient = useQueryClient();
  const { trustBadges, isLoading, error, refetch } = useTrustBadges();
  const [formOpen, setFormOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<CmsTrustBadge | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: trustBadgeKeys.all });
  }

  async function handleDelete(badge: CmsTrustBadge) {
    if (!window.confirm(`نشان «${badge.name.fa}» حذف شود؟`)) return;
    setActionError(null);
    try {
      await deleteTrustBadge(badge.id);
      invalidate();
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "حذف نشان انجام نشد.",
      );
    }
  }

  async function handleStatusChange(
    badge: CmsTrustBadge,
    status: CmsTrustBadgeStatus,
  ) {
    setActionError(null);
    setUpdatingStatusId(badge.id);
    try {
      await updateTrustBadgeStatus(badge.id, status);
      invalidate();
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "تغییر وضعیت نشان انجام نشد.",
      );
    } finally {
      setUpdatingStatusId(null);
    }
  }

  async function handleReorder(fromIndex: number, toIndex: number) {
    if (toIndex < 0 || toIndex >= trustBadges.length || fromIndex === toIndex) {
      return;
    }
    const reordered = [...trustBadges];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    setIsReordering(true);
    setActionError(null);
    try {
      await reorderTrustBadges(reordered.map((badge) => badge.id));
      invalidate();
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "مرتب‌سازی نشان‌ها انجام نشد.",
      );
    } finally {
      setIsReordering(false);
    }
  }

  return (
    <PageContainer>
      <Breadcrumb items={[{ label: "داشبورد" }, { label: "نشان‌های اعتماد" }]} />
      <PermissionGate
        permission="website.content:read"
        fallback={
          <>
            <PageHeader title="نشان‌های اعتماد" />
            <Section>
              <EmptyState
                title="دسترسی ندارید"
                description="برای مشاهده نشان‌ها به مجوز مشاهده محتوا نیاز دارید."
              />
            </Section>
          </>
        }
      >
        <PageHeader
          title="نشان‌های اعتماد"
          description="مدیریت نشان‌هایی که در پایین سایت نمایش داده می‌شوند."
        >
          <PermissionGate permission="website.content:write">
            <button
              type="button"
              onClick={() => {
                setEditingBadge(null);
                setFormOpen(true);
              }}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
            >
              نشان جدید
            </button>
          </PermissionGate>
        </PageHeader>
        <Section>
          {actionError ? (
            <p role="alert" className="mb-3 text-sm text-red-600">
              {actionError}
            </p>
          ) : null}
          <TrustBadgeList
            trustBadges={trustBadges}
            isLoading={isLoading}
            error={error instanceof Error ? error : null}
            isReordering={isReordering}
            updatingStatusId={updatingStatusId}
            onEdit={(badge) => {
              setEditingBadge(badge);
              setFormOpen(true);
            }}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            onReorder={handleReorder}
          />
        </Section>
        {formOpen ? (
          <TrustBadgeForm
            trustBadge={editingBadge}
            onCancel={() => setFormOpen(false)}
            onSaved={() => {
              setFormOpen(false);
              setEditingBadge(null);
              refetch();
              invalidate();
            }}
          />
        ) : null}
      </PermissionGate>
    </PageContainer>
  );
}
