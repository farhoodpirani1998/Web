import { useState } from "react";

import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { PermissionGate } from "@/components/ui/PermissionGate";
import { Section } from "@/components/ui/Section";
import { ApiError } from "@/lib/apiError";

import { reorderAchievements, updateAchievementStatus } from "./api";
import { AchievementDeleteConfirm } from "./AchievementDeleteConfirm";
import { AchievementForm } from "./AchievementForm";
import { AchievementList } from "./AchievementList";
import { AchievementStatusFilter } from "./AchievementStatusFilter";
import { useAchievements } from "./hooks/useAchievements";
import type { CmsAchievement, CmsAchievementStatus } from "./types";

/**
 * The Achievements admin page (`/admin/achievements`, wired via
 * `pages/AchievementsPage.tsx`). Manages the figures shown in the
 * homepage "افتخارات" band — the same create/publish/reorder
 * lifecycle as `FaqPage`, which this mirrors.
 */
export function AchievementsPage() {
  const [status, setStatus] = useState<CmsAchievementStatus | undefined>(undefined);
  const { achievements, isLoading, error, refetch, setAchievements } = useAchievements(status);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<CmsAchievement | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CmsAchievement | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  function handleCreate() {
    setEditing(null);
    setIsFormOpen(true);
  }

  function handleEdit(achievement: CmsAchievement) {
    setEditing(achievement);
    setIsFormOpen(true);
  }

  function handleSaved() {
    setIsFormOpen(false);
    setEditing(null);
    refetch();
  }

  function handleDeleted() {
    setPendingDelete(null);
    refetch();
  }

  async function handleChangeStatus(achievement: CmsAchievement, nextStatus: CmsAchievementStatus) {
    setActionError(null);
    setUpdatingStatusId(achievement.id);

    try {
      const updated = await updateAchievementStatus(achievement.id, nextStatus);
      setAchievements((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "مشکلی پیش آمد. لطفاً دوباره تلاش کنید.",
      );
    } finally {
      setUpdatingStatusId(null);
    }
  }

  async function handleReorder(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= achievements.length) return;

    const reordered = [...achievements];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    const previous = achievements;
    setAchievements(reordered);
    setActionError(null);
    setIsReordering(true);

    try {
      await reorderAchievements(reordered.map((item) => item.id));
    } catch (err) {
      setAchievements(previous);
      setActionError(
        err instanceof ApiError ? err.message : "مشکلی پیش آمد. لطفاً دوباره تلاش کنید.",
      );
    } finally {
      setIsReordering(false);
    }
  }

  return (
    <PageContainer>
      <Breadcrumb items={[{ label: "داشبورد" }, { label: "افتخارات" }]} />

      <PermissionGate
        permission="website.content:read"
        fallback={
          <>
            <PageHeader title="افتخارات" />
            <Section>
              <EmptyState
                title="به افتخارات دسترسی ندارید"
                description="مشاهده افتخارات نیازمند دسترسی محتوا است. در صورت نیاز با مدیر تماس بگیرید."
              />
            </Section>
          </>
        }
      >
        <PageHeader
          title="افتخارات"
          description="مدیریت آمارهای نمایش‌داده‌شده در بخش افتخارات صفحه اصلی."
        >
          <PermissionGate permission="website.content:write">
            <button
              type="button"
              onClick={handleCreate}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              افتخار جدید
            </button>
          </PermissionGate>
        </PageHeader>

        <Section>
          <div className="flex flex-col gap-4">
            <AchievementStatusFilter value={status} onChange={setStatus} />

            {actionError ? (
              <p role="alert" className="text-sm text-red-600">
                {actionError}
              </p>
            ) : null}

            <AchievementList
              achievements={achievements}
              isLoading={isLoading}
              error={error}
              status={status}
              updatingStatusId={updatingStatusId}
              isReordering={isReordering}
              onEdit={handleEdit}
              onDeleteRequest={setPendingDelete}
              onChangeStatus={handleChangeStatus}
              onReorder={handleReorder}
            />
          </div>
        </Section>

        {isFormOpen ? (
          <AchievementForm
            achievement={editing}
            onCancel={() => setIsFormOpen(false)}
            onSaved={handleSaved}
          />
        ) : null}

        {pendingDelete ? (
          <AchievementDeleteConfirm
            achievement={pendingDelete}
            onCancel={() => setPendingDelete(null)}
            onDeleted={handleDeleted}
          />
        ) : null}
      </PermissionGate>
    </PageContainer>
  );
}
