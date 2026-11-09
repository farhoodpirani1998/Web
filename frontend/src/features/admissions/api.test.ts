import { beforeEach, describe, expect, it, vi } from "vitest";

const { getMock } = vi.hoisted(() => ({ getMock: vi.fn() }));
vi.mock("@/shared/api", () => ({ apiClient: { get: getMock } }));

import { fetchAdmissions } from "./api";

describe("fetchAdmissions", () => {
  beforeEach(() => getMock.mockReset());

  it("requests campus and shared admission content through the campus filter", async () => {
    getMock.mockResolvedValue({ data: [] });

    await fetchAdmissions("campus-1");

    expect(getMock).toHaveBeenCalledWith("/admissions", { params: { campusId: "campus-1" } });
  });

  it("preserves the unfiltered admissions request", async () => {
    getMock.mockResolvedValue({ data: [] });

    await fetchAdmissions();

    expect(getMock).toHaveBeenCalledWith("/admissions");
  });
});
