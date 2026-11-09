import { beforeEach, describe, expect, it, vi } from "vitest";

const { getMock } = vi.hoisted(() => ({ getMock: vi.fn() }));
vi.mock("@/shared/api", () => ({ apiClient: { get: getMock } }));

import { fetchTeachers } from "./api";

describe("fetchTeachers", () => {
  beforeEach(() => getMock.mockReset());

  it("requests campus and shared teachers through the campus filter", async () => {
    getMock.mockResolvedValue({ data: [] });

    await fetchTeachers("campus-1");

    expect(getMock).toHaveBeenCalledWith("/teachers", { params: { campusId: "campus-1" } });
  });

  it("preserves the unfiltered teachers request", async () => {
    getMock.mockResolvedValue({ data: [] });

    await fetchTeachers();

    expect(getMock).toHaveBeenCalledWith("/teachers");
  });
});
