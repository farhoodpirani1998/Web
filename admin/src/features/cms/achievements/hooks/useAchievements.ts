import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiError } from "@/lib/apiError";
import {
  fetchAchievementList,
  fetchAchievementById,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  updateAchievementStatus,
  reorderAchievements,
} from "../api";
import type { CmsAchievement, CmsAchievementStatus } from "../types";

export const achievementKeys = {
  all: ["achievements"] as const,
  list: (status?: CmsAchievementStatus) => [...achievementKeys.all, "list", status ?? "all"] as const,
  detail: (id: string) => [...achievementKeys.all, "detail", id] as const,
};

export function useAchievementList(status?: CmsAchievementStatus) {
  return useQuery<CmsAchievement[], ApiError>({
    queryKey: achievementKeys.list(status),
    queryFn: () => fetchAchievementList(status),
  });
}

export function useAchievement(id: string | null) {
  return useQuery<CmsAchievement, ApiError>({
    queryKey: id ? achievementKeys.detail(id) : ["achievements", "detail", "null"],
    queryFn: () => (id ? fetchAchievementById(id) : Promise.reject(new Error("no id"))),
    enabled: !!id,
  });
}

export function useAchievementMutations() {
  const qc = useQueryClient();
  const create = useMutation({ mutationFn: createAchievement, onSuccess: () => qc.invalidateQueries({ queryKey: achievementKeys.all }) });
  const update = useMutation({ mutationFn: ({ id, payload }: { id: string; payload: any }) => updateAchievement(id, payload), onSuccess: () => qc.invalidateQueries({ queryKey: achievementKeys.all }) });
  const del = useMutation({ mutationFn: deleteAchievement, onSuccess: () => qc.invalidateQueries({ queryKey: achievementKeys.all }) });
  const statusMut = useMutation({ mutationFn: ({ id, status }: { id: string; status: CmsAchievementStatus }) => updateAchievementStatus(id, status), onSuccess: () => qc.invalidateQueries({ queryKey: achievementKeys.all }) });
  const reorder = useMutation({ mutationFn: reorderAchievements, onSuccess: () => qc.invalidateQueries({ queryKey: achievementKeys.all }) });
  return { create, update, del, statusMut, reorder };
}
