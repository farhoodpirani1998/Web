import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CmsPreRegistration } from "../types";
import {
  updatePreRegistrationAssignment,
  updatePreRegistrationStatus,
} from "../api";
import { preRegistrationKeys, usePreRegistrationMutations } from "./usePreRegistrations";

vi.mock("../api", () => ({
  fetchPreRegistrationById: vi.fn(),
  fetchPreRegistrationList: vi.fn(),
  updatePreRegistrationAssignment: vi.fn(),
  updatePreRegistrationStatus: vi.fn(),
}));

const registration: CmsPreRegistration = {
  id: "registration-1",
  createdAt: "2026-10-13T10:00:00.000Z",
  updatedAt: "2026-10-13T10:00:00.000Z",
  studentFirstName: "علی",
  studentLastName: "محمدی",
  studentNationalId: "1234567891",
  studentBirthDate: "2015-01-01",
  studentGrade: "grade-1",
  guardianFullName: "رضا محمدی",
  guardianPhone: "09121234567",
  status: "new",
};

describe("usePreRegistrationMutations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("moves a status-updated registration between status-filtered list caches", async () => {
    const updated = { ...registration, status: "contacted" as const };
    vi.mocked(updatePreRegistrationStatus).mockResolvedValue(updated);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    queryClient.setQueryData(preRegistrationKeys.list(), [registration]);
    queryClient.setQueryData(preRegistrationKeys.list("new"), [registration]);
    queryClient.setQueryData(preRegistrationKeys.list("contacted"), []);

    function Wrapper({ children }: PropsWithChildren) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    }

    const { result } = renderHook(() => usePreRegistrationMutations(), { wrapper: Wrapper });
    await act(async () => {
      await result.current.statusMut.mutateAsync({
        id: registration.id,
        status: "contacted",
      });
    });

    expect(queryClient.getQueryData(preRegistrationKeys.list())).toEqual([updated]);
    expect(queryClient.getQueryData(preRegistrationKeys.list("new"))).toEqual([]);
    expect(queryClient.getQueryData(preRegistrationKeys.list("contacted"))).toEqual([
      updated,
    ]);
    expect(queryClient.getQueryData(preRegistrationKeys.detail(registration.id))).toEqual(
      updated,
    );
    queryClient.clear();
  });

  it("updates assignment and follow-up values without changing status", async () => {
    const updated = {
      ...registration,
      assignedAdminId: "admin-1",
      followUpAt: "2026-10-25T10:00:00.000Z",
    };
    vi.mocked(updatePreRegistrationAssignment).mockResolvedValue(updated);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    queryClient.setQueryData(preRegistrationKeys.list(), [registration]);
    queryClient.setQueryData(preRegistrationKeys.list("new"), [registration]);

    function Wrapper({ children }: PropsWithChildren) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    }

    const { result } = renderHook(() => usePreRegistrationMutations(), { wrapper: Wrapper });
    const payload = {
      assignedAdminId: "admin-1",
      followUpAt: updated.followUpAt,
    };
    await act(async () => {
      await result.current.followUpMut.mutateAsync({ id: registration.id, payload });
    });

    expect(updatePreRegistrationAssignment).toHaveBeenCalledWith(registration.id, payload);
    expect(queryClient.getQueryData(preRegistrationKeys.list())).toEqual([updated]);
    expect(queryClient.getQueryData(preRegistrationKeys.list("new"))).toEqual([updated]);
    expect(queryClient.getQueryData(preRegistrationKeys.detail(registration.id))).toEqual(
      updated,
    );
    expect(updated.status).toBe("new");
    queryClient.clear();
  });
});
