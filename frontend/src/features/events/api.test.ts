import { beforeEach, describe, expect, it, vi } from "vitest";

const { getMock } = vi.hoisted(() => ({ getMock: vi.fn() }));
vi.mock("@/shared/api", () => ({ apiClient: { get: getMock } }));

import { fetchEvents } from "./api";

describe("fetchEvents", () => {
  beforeEach(() => getMock.mockReset());

  it("requests campus and shared events through the campus filter", async () => {
    getMock.mockResolvedValue({ data: { items: [], meta: {} } });

    await fetchEvents("campus-1");

    expect(getMock).toHaveBeenCalledWith("/events", {
      params: { limit: 100, campusId: "campus-1" },
    });
  });

  it("preserves the unfiltered events request", async () => {
    getMock.mockResolvedValue({ data: { items: [], meta: {} } });

    await fetchEvents();

    expect(getMock).toHaveBeenCalledWith("/events", { params: { limit: 100 } });
  });
});
