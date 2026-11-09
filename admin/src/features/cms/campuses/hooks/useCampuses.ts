/** TanStack Query hooks for campuses — mirrors teachers hook pattern. */
import { useMutation, useQuery, useQueryClient, type UseMutateFunction, type UseQueryResult } from "@tanstack/react-query";
import type { ApiError } from "@/lib/apiError";
import { createCampus, deleteCampus, fetchCampusById, fetchCampusesList, reorderCampuses, updateCampus, updateCampusStatus, scheduleCampus } from "../api";
import type {
  CmsCampus,
  CmsCampusStatus,
  ScheduleCampusPayload,
  UpdateCampusPayload,
} from "../types";

export const campusKeys = {
  all: ["campuses"] as const,
  list: (status?: CmsCampusStatus) => [...campusKeys.all, "list", status ?? "all"] as const,
  detail: (id: string) => [...campusKeys.all, "detail", id] as const,
};

export interface UseCampusListResult {
  data: CmsCampus[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: ApiError | null;
  refetch: UseQueryResult<CmsCampus[], ApiError>["refetch"];
  setData: (updater: CmsCampus[] | ((old: CmsCampus[] | undefined) => CmsCampus[])) => void;
}

export function useCampusList(status?: CmsCampusStatus): UseCampusListResult {
  const qc = useQueryClient();
  const query = useQuery<CmsCampus[], ApiError>({ queryKey: campusKeys.list(status), queryFn: () => fetchCampusesList(status), staleTime: 30_000 });
  const setData = (updater: CmsCampus[] | ((old: CmsCampus[] | undefined) => CmsCampus[])) => qc.setQueryData<CmsCampus[]>(campusKeys.list(status), updater);
  return { data: query.data, isLoading: query.isLoading, isError: query.isError, error: query.error as ApiError | null, refetch: query.refetch, setData };
}

export interface UseCampusesResult {
  campuses: CmsCampus[];
  isLoading: boolean;
  isError: boolean;
  error: ApiError | null;
  refetch: UseQueryResult<CmsCampus[], ApiError>["refetch"];
  setCampuses: (updater: CmsCampus[] | ((current: CmsCampus[]) => CmsCampus[])) => void;
}

export function useCampuses(status?: CmsCampusStatus): UseCampusesResult {
  const queryClient = useQueryClient();
  const query = useCampusList(status);
  const queryKey = campusKeys.list(status);

  return {
    campuses: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    setCampuses: (updater) =>
      queryClient.setQueryData<CmsCampus[]>(queryKey, (current = []) =>
        typeof updater === "function" ? updater(current) : updater,
      ),
  };
}

export function useCampusById(id: string | null) {
  return useQuery({ queryKey: id ? campusKeys.detail(id) : ["campuses","detail","null"], queryFn: () => fetchCampusById(id!), enabled: !!id, staleTime: 30_000 });
}

export interface UseCampusMutations {
  create: UseMutateFunction<CmsCampus, ApiError, Parameters<typeof createCampus>[0]>;
  update: UseMutateFunction<CmsCampus, ApiError, { id: string; payload: UpdateCampusPayload }>;
  delete: UseMutateFunction<void, ApiError, string>;
  updateStatus: UseMutateFunction<CmsCampus, ApiError, { id: string; status: CmsCampusStatus }>;
  schedule: UseMutateFunction<CmsCampus, ApiError, { id: string; payload: ScheduleCampusPayload }>;
  reorder: UseMutateFunction<void, ApiError, string[]>;
}

export function useCampusMutations(): UseCampusMutations {
  const qc = useQueryClient();
  const create = useMutation<CmsCampus, ApiError, Parameters<typeof createCampus>[0]>({ mutationFn: createCampus, onSuccess: (d) => { qc.setQueryData<CmsCampus[]>(campusKeys.list(), (old) => old ? [d, ...old] : [d]); qc.invalidateQueries({ queryKey: campusKeys.all, exact: false }); } });
  const update = useMutation<CmsCampus, ApiError, { id: string; payload: UpdateCampusPayload }>({ mutationFn: ({ id, payload }) => updateCampus(id, payload), onSuccess: (d) => { qc.setQueryData<CmsCampus[]>(campusKeys.list(), (old) => old?.map((c) => c.id === d.id ? d : c) ?? []); qc.invalidateQueries({ queryKey: campusKeys.all, exact: false }); qc.setQueryData(campusKeys.detail(d.id), d); } });
  const del = useMutation<void, ApiError, string>({ mutationFn: deleteCampus, onSuccess: (_d, id) => { qc.setQueryData<CmsCampus[]>(campusKeys.list(), (old) => old?.filter((c) => c.id !== id) ?? []); qc.invalidateQueries({ queryKey: campusKeys.all, exact: false }); qc.removeQueries({ queryKey: campusKeys.detail(id) }); } });
  const updateStatus = useMutation<CmsCampus, ApiError, { id: string; status: CmsCampusStatus }>({ mutationFn: ({ id, status }) => updateCampusStatus(id, status), onSuccess: (d) => { qc.invalidateQueries({ queryKey: campusKeys.all, exact: false }); qc.setQueryData(campusKeys.detail(d.id), d); } });
  const schedule = useMutation<CmsCampus, ApiError, { id: string; payload: ScheduleCampusPayload }>({ mutationFn: ({ id, payload }) => scheduleCampus(id, payload), onSuccess: (d) => { qc.invalidateQueries({ queryKey: campusKeys.all, exact: false }); qc.setQueryData(campusKeys.detail(d.id), d); } });
  const reorder = useMutation<void, ApiError, string[]>({ mutationFn: reorderCampuses, onSuccess: () => qc.invalidateQueries({ queryKey: campusKeys.all, exact: false }) });
  return { create: create.mutate, update: update.mutate, delete: del.mutate, updateStatus: updateStatus.mutate, schedule: schedule.mutate, reorder: reorder.mutate };
}
