import { beforeEach, describe, expect, it, vi } from "vitest";

const { getMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
}));

vi.mock("@/shared/api", () => ({
  apiClient: { get: getMock },
}));

import { fetchFaq } from "./api";

describe("fetchFaq", () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  it("resolves translated question and answer objects to Persian strings", async () => {
    getMock.mockResolvedValue({
      data: [
        {
          id: "faq-1",
          question: { fa: "پرسش فارسی", en: "English question" },
          answer: { fa: "پاسخ فارسی", en: "English answer" },
          category: "general",
          position: 1,
        },
      ],
    });

    await expect(fetchFaq()).resolves.toEqual([
      {
        id: "faq-1",
        question: "پرسش فارسی",
        answer: "پاسخ فارسی",
      },
    ]);
    expect(getMock).toHaveBeenCalledWith("/faq");
  });
});
