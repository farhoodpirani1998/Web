import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "@/shared/api";

import { fetchTextbooks, fetchTextbookTaxonomies } from "./api";

vi.mock("@/shared/api", () => ({
  apiClient: { get: vi.fn() },
}));

describe("textbook public API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requests one server-paginated page with the selected filters and sorting", async () => {
    const result = {
      items: [],
      meta: { page: 3, limit: 12, total: 31, totalPages: 3 },
    };
    vi.mocked(apiClient.get).mockResolvedValue({ data: result });

    await expect(
      fetchTextbooks({
        page: 3,
        q: "ریاضی ",
        stage: "secondary",
        grade: "10",
        field: "science",
        subject: "math",
        year: "1405",
        sort: "year",
        order: "DESC",
      }),
    ).resolves.toEqual(result);

    expect(apiClient.get).toHaveBeenCalledWith("/textbooks", {
      params: {
        page: 3,
        limit: 12,
        q: "ریاضی",
        stage: "secondary",
        grade: "10",
        field: "science",
        subject: "math",
        year: "1405",
        sort: "year",
        order: "DESC",
      },
    });
  });

  it("requests taxonomy choices from the public endpoint", async () => {
    const options = {
      stage: [{ value: "primary", label: "ابتدایی" }],
      grade: [],
      field: [],
      subject: [],
      year: [],
    };
    vi.mocked(apiClient.get).mockResolvedValue({ data: options });

    await expect(fetchTextbookTaxonomies()).resolves.toEqual(options);
    expect(apiClient.get).toHaveBeenCalledWith("/textbooks/taxonomies");
  });
});
