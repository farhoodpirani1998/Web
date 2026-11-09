import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiError } from "@/lib/apiError";
import {
  deleteContactMessage,
  fetchContactMessages,
  updateContactMessageStatus,
} from "../api";
import type { ContactMessage, ContactMessageStatus } from "../types";

const queryKey = ["contact-messages"] as const;

export function useContactMessages() {
  const queryClient = useQueryClient();
  const query = useQuery<ContactMessage[], ApiError>({
    queryKey,
    queryFn: fetchContactMessages,
  });
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ContactMessageStatus }) =>
      updateContactMessageStatus(id, status),
    onSuccess: (updated) => {
      queryClient.setQueryData<ContactMessage[]>(queryKey, (messages) =>
        messages?.map((message) => (message.id === updated.id ? updated : message)),
      );
    },
  });
  const remove = useMutation({
    mutationFn: deleteContactMessage,
    onSuccess: (_, id) => {
      queryClient.setQueryData<ContactMessage[]>(queryKey, (messages) =>
        messages?.filter((message) => message.id !== id),
      );
    },
  });

  return {
    messages: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    updateStatus,
    remove,
  };
}
