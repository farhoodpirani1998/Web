import { beforeEach, describe, expect, it, vi } from "vitest";

const { postMock } = vi.hoisted(() => ({ postMock: vi.fn() }));
vi.mock("@/shared/api", () => ({ apiClient: { post: postMock } }));

import { submitPreRegistration } from "./api";

describe("submitPreRegistration", () => {
  beforeEach(() => postMock.mockReset());

  it("returns the backend-issued reference code", async () => {
    const payload = {
      studentFirstName: "نام",
      studentLastName: "خانوادگی",
      studentNationalId: "1234567890",
      studentBirthDate: "2015-01-01",
      studentGrade: "grade-1",
      guardianFullName: "سرپرست",
      guardianPhone: "09123456789",
    };
    const result = { id: "registration-id", referenceCode: "NH-2026-1234" };
    postMock.mockResolvedValue({ data: result });

    await expect(submitPreRegistration(payload)).resolves.toEqual(result);
    expect(postMock).toHaveBeenCalledWith("/pre-registration", payload);
  });
});
