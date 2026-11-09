export type ContactMessageStatus = "new" | "contacted" | "closed";
export type ContactMessageSubject =
  "educational-consultation" | "course-information" | "group-collaboration" | "other";

export interface ContactMessage {
  id: string;
  fullName: string;
  phone: string;
  subject: ContactMessageSubject;
  message: string;
  status: ContactMessageStatus;
  createdAt: string;
}
