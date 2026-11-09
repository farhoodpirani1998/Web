import { beforeEach, describe, expect, it, vi } from "vitest";

const { getMock } = vi.hoisted(() => ({ getMock: vi.fn() }));
vi.mock("@/shared/api", () => ({ apiClient: { get: getMock } }));

import { fetchCampuses, fetchCampusBySlug } from "./api";

describe("campus public API", () => {
  beforeEach(() => getMock.mockReset());

  it("maps published grade levels from the campus list response", async () => {
    getMock.mockResolvedValue({
      data: [
        {
          id: "campus-1",
          title: { fa: "مدرسه نمونه" },
          slug: "sample-school",
          gradeLevels: ["پایه اول", "پایه دوم"],
          position: 0,
          featuredImage: null,
        },
      ],
    });

    await expect(fetchCampuses()).resolves.toMatchObject([
      { id: "campus-1", name: "مدرسه نمونه", gradeLevels: ["پایه اول", "پایه دوم"] },
    ]);
    expect(getMock).toHaveBeenCalledWith("/campuses");
  });

  it("fetches school detail from the campus slug endpoint", async () => {
    const detail = {
      id: "campus-1",
      title: { fa: "مدرسه نمونه" },
      slug: "sample-school",
      body: { fa: "متن مدرسه" },
      gradeLevels: ["پایه اول"],
      seo: null,
      structuredData: [],
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    getMock.mockResolvedValue({ data: detail });

    await expect(fetchCampusBySlug("sample-school")).resolves.toEqual(detail);
    expect(getMock).toHaveBeenCalledWith("/campuses/sample-school");
  });
});
