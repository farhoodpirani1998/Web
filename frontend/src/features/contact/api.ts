import { apiClient } from "@/shared/api";

export type ContactMessageSubject =
  "educational-consultation" | "course-information" | "group-collaboration" | "other";

export interface ContactMessagePayload {
  fullName: string;
  phone: string;
  subject: ContactMessageSubject;
  message: string;
}

export async function submitContactMessage(
  payload: ContactMessagePayload,
): Promise<void> {
  await apiClient.post("/contact-messages", payload);
}
