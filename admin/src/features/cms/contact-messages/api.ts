import { apiClient } from "@/lib/apiClient";
import type { ContactMessage, ContactMessageStatus } from "./types";

export async function fetchContactMessages(): Promise<ContactMessage[]> {
  const response = await apiClient.get<ContactMessage[]>("/contact-messages");
  return response.data;
}

export async function updateContactMessageStatus(
  id: string,
  status: ContactMessageStatus,
): Promise<ContactMessage> {
  const response = await apiClient.patch<ContactMessage>(
    `/contact-messages/${id}/status`,
    { status },
  );
  return response.data;
}

export async function deleteContactMessage(id: string): Promise<void> {
  await apiClient.delete(`/contact-messages/${id}`);
}
