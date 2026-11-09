import { beforeEach, describe, expect, it, vi } from "vitest";

const { getMock } = vi.hoisted(() => ({ getMock: vi.fn() }));
vi.mock("@/shared/api", () => ({ apiClient: { get: getMock } }));

import { fetchNews } from "./api";

describe("fetchNews", () => {
  beforeEach(() => getMock.mockReset());

  it("requests campus and shared news through the campus filter", async () => {
    getMock.mockResolvedValue({ data: { items: [], meta: {} } });

    await fetchNews("campus-1");

    expect(getMock).toHaveBeenCalledWith("/news", {
      params: { limit: 100, campusId: "campus-1" },
    });
  });

  it("preserves the unfiltered news request", async () => {
    getMock.mockResolvedValue({ data: { items: [], meta: {} } });

    await fetchNews();

    expect(getMock).toHaveBeenCalledWith("/news", { params: { limit: 100 } });
  });
});
