import { render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { useTextbookBySlugMock } = vi.hoisted(() => ({
  useTextbookBySlugMock: vi.fn(),
}));

vi.mock("@/features/textbooks", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/textbooks")>();
  return { ...actual, useTextbookBySlug: useTextbookBySlugMock };
});

vi.mock("@/shared/seo", () => ({ Seo: () => null }));

import { TextbookDetailPage } from "./TextbookDetailPage";

const textbook = {
  id: "textbook-1",
  title: { fa: "ریاضی نمونه" },
  slug: "sample-math",
  code: "101",
  stage: "متوسطه",
  grade: "دهم",
  field: null,
  subject: "ریاضی",
  academicYear: "۱۴۰۵-۱۴۰۶",
  edition: null,
  pageCount: 120,
  fileSize: "2097152",
  sourceType: "UPLOADED" as const,
  sourceAttribution: "وزارت آموزش و پرورش",
  licenseNote: null,
  downloadCount: "1253",
  createdAt: "2026-01-01T00:00:00.000Z",
  downloadUrl: "https://example.test/textbook.pdf",
};

function renderDetailPage() {
  return render(
    <MemoryRouter initialEntries={["/library/sample-math"]}>
      <Routes>
        <Route path="/library/:slug" element={<TextbookDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("TextbookDetailPage metadata", () => {
  beforeEach(() => {
    useTextbookBySlugMock.mockReset();
  });

  it("shows a readable file size and localized download count", () => {
    useTextbookBySlugMock.mockReturnValue({
      data: textbook,
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderDetailPage();

    const size = screen.getByText("حجم فایل").parentElement;
    expect(size).not.toBeNull();
    expect(within(size!).getByText(/۲ مگابایت|2 MB/i)).toBeInTheDocument();

    const downloads = screen.getByText("تعداد دریافت").parentElement;
    expect(downloads).not.toBeNull();
    expect(within(downloads!).getByText(/۱٬۲۵۳|1,253/)).toBeInTheDocument();
  });

  it("identifies external-link source information without showing a file size", () => {
    useTextbookBySlugMock.mockReturnValue({
      data: { ...textbook, sourceType: "EXTERNAL_LINK", fileSize: "0" },
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderDetailPage();

    const source = screen.getByText("نوع منبع").parentElement;
    expect(source).not.toBeNull();
    expect(within(source!).getByText("پیوند خارجی")).toBeInTheDocument();
    expect(screen.queryByText("حجم فایل")).not.toBeInTheDocument();
    expect(screen.getByText("منبع: وزارت آموزش و پرورش")).toBeInTheDocument();
  });
});
