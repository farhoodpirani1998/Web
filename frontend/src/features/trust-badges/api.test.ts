import { beforeEach, describe, expect, it, vi } from "vitest";

const { getMock } = vi.hoisted(() => ({ getMock: vi.fn() }));
vi.mock("@/shared/api", () => ({ apiClient: { get: getMock } }));

import { fetchTrustBadges } from "./api";

describe("fetchTrustBadges", () => {
  beforeEach(() => getMock.mockReset());

  it("reads the public trust badges endpoint as a public DTO list", async () => {
    const badges = [
      {
        id: "badge-1",
        name: { fa: "نشان" },
        image: { url: "https://cdn.test/badge.png", altText: "نشان" },
        position: 0,
      },
    ];
    getMock.mockResolvedValue({ data: badges });

    await expect(fetchTrustBadges()).resolves.toEqual(badges);
    expect(getMock).toHaveBeenCalledWith("/trust-badges");
  });
});
