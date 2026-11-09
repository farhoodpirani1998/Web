import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiError } from "@/lib/apiError";
import {
  createStatistic,
  deleteStatistic,
  fetchStatisticById,
  fetchStatisticList,
  reorderStatistics,
  updateStatistic,
  updateStatisticStatus,
} from "../api";
import type { CmsStatistic, CmsStatisticStatus } from "../types";

export const statisticKeys = {
  all: ["statistics"] as const,
  list: (status?: CmsStatisticStatus) => [...statisticKeys.all, "list", status ?? "all"] as const,
  detail: (id: string) => [...statisticKeys.all, "detail", id] as const,
};

export function useStatisticList(status?: CmsStatisticStatus) {
  return useQuery<CmsStatistic[], ApiError>({
    queryKey: statisticKeys.list(status),
    queryFn: () => fetchStatisticList(status),
  });
}

export function useStatistics(status?: CmsStatisticStatus) {
  const queryClient = useQueryClient();
  const query = useStatisticList(status);
  const setStatistics = (
    updater: CmsStatistic[] | ((current: CmsStatistic[]) => CmsStatistic[]),
  ) => {
    queryClient.setQueryData<CmsStatistic[]>(statisticKeys.list(status), (current) =>
      typeof updater === "function" ? updater(current ?? []) : updater,
    );
  };

  return {
    statistics: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    setStatistics,
  };
}

export function useStatistic(id: string | null) {
  return useQuery<CmsStatistic, ApiError>({
    queryKey: id ? statisticKeys.detail(id) : ["statistics", "detail", "null"],
    queryFn: () => (id ? fetchStatisticById(id) : Promise.reject(new Error("no id"))),
    enabled: !!id,
  });
}

export function useStatisticMutations() {
  const queryClient = useQueryClient();
  const invalidateStatistics = () =>
    queryClient.invalidateQueries({ queryKey: statisticKeys.all });
  const create = useMutation({ mutationFn: createStatistic, onSuccess: invalidateStatistics });
  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateStatistic>[1] }) =>
      updateStatistic(id, payload),
    onSuccess: invalidateStatistics,
  });
  const del = useMutation({ mutationFn: deleteStatistic, onSuccess: invalidateStatistics });
  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CmsStatisticStatus }) =>
      updateStatisticStatus(id, status),
    onSuccess: invalidateStatistics,
  });
  const reorder = useMutation({ mutationFn: reorderStatistics, onSuccess: invalidateStatistics });

  return { create, update, del, statusMut, reorder };
}
