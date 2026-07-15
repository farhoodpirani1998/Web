import { apiClient } from "@/shared/api";

import type { Teacher } from "./types";

/**
 * Request functions for the `teachers` feature's Public API endpoint.
 *
 * Per §14/§30, this is the only file in the `teachers` feature aware
 * of the endpoint's URL — `useTeachers` and any future consumer call
 * `fetchTeachers`, never `apiClient` directly.
 */
export async function fetchTeachers(): Promise<readonly Teacher[]> {
  const response = await apiClient.get<readonly Teacher[]>("/teachers");
  return response.data;
}
