/**
 * TanStack Query (React Query) hooks for the FAQ module.
 * Replaces manual useState + useEffect with server-state management.
 */
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutateFunction,
} from "@tanstack/react-query";

import type { ApiError } from "@/lib/apiError";

import {
  createFaq,
  deleteFaq,
  fetchFaqById,
  fetchFaqList,
  reorderFaqs,
  updateFaq,
  updateFaqStatus,
} from "../api";
import type { CmsFaq, CmsFaqStatus, CreateFaqPayload, UpdateFaqPayload } from "../types";

export const faqKeys = {
  all: ["faqs"] as const,
  list: (status?: CmsFaqStatus) => [...faqKeys.all, "list", status ?? "all"] as const,
  detail: (id: string) => [...faqKeys.all, "detail", id] as const,
};

export interface UseFaqsResult {
  faqs: CmsFaq[];
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => void;
  setFaqs: (updater: CmsFaq[] | ((old: CmsFaq[]) => CmsFaq[])) => void;
}

export function useFaqs(status?: CmsFaqStatus): UseFaqsResult {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: faqKeys.list(status),
    queryFn: () => fetchFaqList(status),
    staleTime: 30_000,
  });

  const setFaqs = (updater: CmsFaq[] | ((old: CmsFaq[]) => CmsFaq[])) => {
    queryClient.setQueryData<CmsFaq[]>(
      faqKeys.list(status),
      typeof updater === "function" ? (old) => updater(old ?? []) : updater,
    );
  };

  return {
    faqs: query.data ?? [],
    isLoading: query.isLoading,
    error: (query.error as ApiError | null) ?? null,
    refetch: () => query.refetch(),
    setFaqs,
  };
}

export function useFaq(id: string | null) {
  return useQuery({
    queryKey: id ? faqKeys.detail(id) : ["faqs", "detail", "null"],
    queryFn: () => fetchFaqById(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export interface UseFaqMutations {
  create: UseMutateFunction<CmsFaq, ApiError, CreateFaqPayload>;
  update: UseMutateFunction<CmsFaq, ApiError, { id: string; payload: UpdateFaqPayload }>;
  delete: UseMutateFunction<void, ApiError, string>;
  updateStatus: UseMutateFunction<CmsFaq, ApiError, { id: string; status: CmsFaqStatus }>;
  reorder: UseMutateFunction<void, ApiError, string[]>;
}

export function useFaqMutations(): UseFaqMutations {
  const queryClient = useQueryClient();

  const create = useMutation<CmsFaq, ApiError, CreateFaqPayload>({
    mutationFn: createFaq,
    onSuccess: (newFaq) => {
      queryClient.setQueryData<CmsFaq[]>(faqKeys.list(undefined), (old) =>
        old ? [newFaq, ...old] : [newFaq],
      );
      queryClient.invalidateQueries({ queryKey: faqKeys.all, exact: false });
    },
  });

  const update = useMutation<CmsFaq, ApiError, { id: string; payload: UpdateFaqPayload }>({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateFaqPayload }) => updateFaq(id, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData<CmsFaq[]>(faqKeys.list(undefined), (old) =>
        old?.map((f) => (f.id === updated.id ? updated : f)) ?? [],
      );
      queryClient.invalidateQueries({ queryKey: faqKeys.all, exact: false });
      queryClient.setQueryData(faqKeys.detail(updated.id), updated);
    },
  });

  const deleteFaqMutation = useMutation<void, ApiError, string>({
    mutationFn: deleteFaq,
    onSuccess: (_data, deletedId) => {
      queryClient.setQueryData<CmsFaq[]>(faqKeys.list(undefined), (old) =>
        old?.filter((f) => f.id !== deletedId) ?? [],
      );
      queryClient.invalidateQueries({ queryKey: faqKeys.all, exact: false });
      queryClient.removeQueries({ queryKey: faqKeys.detail(deletedId) });
    },
  });

  const updateStatus = useMutation<
    CmsFaq,
    ApiError,
    { id: string; status: CmsFaqStatus },
    { snapshots: (readonly [readonly unknown[], unknown])[] }
  >({
    mutationFn: ({ id, status }: { id: string; status: CmsFaqStatus }) => updateFaqStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: faqKeys.all });
      const previousLists = queryClient.getQueryCache().findAll({ queryKey: faqKeys.all });
      const snapshots = previousLists.map((q) => [q.queryKey, queryClient.getQueryData(q.queryKey)] as const);
      queryClient.setQueryData<CmsFaq[]>(faqKeys.list(undefined), (old) =>
        old?.map((f) => (f.id === id ? { ...f, status } : f)) ?? [],
      );
      queryClient.setQueryData<CmsFaq[]>(faqKeys.list(status), (old) =>
        old?.map((f) => (f.id === id ? { ...f, status } : f)) ?? [],
      );
      queryClient.setQueryData(faqKeys.detail(id), (old: CmsFaq | undefined) =>
        old ? { ...old, status } : old,
      );
      return { snapshots };
    },
    onError: (_err, _vars, context) => {
      context?.snapshots?.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: faqKeys.all, exact: false });
    },
  });

  const reorder = useMutation<
    void,
    ApiError,
    string[],
    { snapshots: (readonly [readonly unknown[], unknown])[] }
  >({
    mutationFn: reorderFaqs,
    onMutate: async (orderedIds) => {
      await queryClient.cancelQueries({ queryKey: faqKeys.all });
      const previousLists = queryClient.getQueryCache().findAll({ queryKey: faqKeys.all });
      const snapshots = previousLists.map((q) => [q.queryKey, queryClient.getQueryData(q.queryKey)] as const);
      queryClient.setQueryData<CmsFaq[]>(faqKeys.list(undefined), (old) => {
        if (!old) return old;
        const byId = new Map(old.map((f) => [f.id, f]));
        return orderedIds.map((id) => byId.get(id)!).filter(Boolean);
      });
      return { snapshots };
    },
    onError: (_err, _vars, context) => {
      context?.snapshots?.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: faqKeys.all, exact: false });
    },
  });

  return {
    create: create.mutate,
    update: update.mutate,
    delete: deleteFaqMutation.mutate,
    updateStatus: updateStatus.mutate,
    reorder: reorder.mutate,
  };
}
