import { z } from "zod";
export const preRegistrationStatusSchema = z.enum(["new","contacted","archived"]);
// No full create/update payload — triage-only (status change via PATCH /:id/status, no POST form)
export type PreRegistrationStatusInput = z.infer<typeof preRegistrationStatusSchema>;
