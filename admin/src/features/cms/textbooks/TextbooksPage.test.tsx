import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
  createTextbook: vi.fn(),
  deleteTextbook: vi.fn(),
  fetchTextbookTaxonomies: vi.fn(),
  fetchTextbooks: vi.fn(),
  updateTextbook: vi.fn(),
  updateTextbookStatus: vi.fn(),
  uploadTextbook: vi.fn(),
}));

vi.mock("./api", () => api);
vi.mock("@/components/ui/PermissionGate", () => ({
  PermissionGate: ({ children }: { children: ReactNode }) => children,
}));

import { TextbooksPage } from "./TextbooksPage";
import type { CmsTextbook, CmsTextbookListResponse } from "./types";

const book: CmsTextbook = {
  id: "book-1",
  title: { fa: "کتاب نمونه" },
  slug: "sample-book",
  code: "sample-1",
  stage: "دبیرستان",
  grade: "دهم",
  field: null,
  subject: "ریاضی",
  academicYear: "۱۴۰۵-۱۴۰۶",
  sourceType: "UPLOADED",
  externalUrl: null,
  sourceAttribution: "وزارت آموزش و پرورش",
  status: "draft",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function response(
  items: CmsTextbook[] = [],
  page = 1,
  totalPages = 1,
  total = items.length,
): CmsTextbookListResponse {
  return { items, meta: { page, limit: 20, total, totalPages } };
}

async function fillNewBook(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "کتاب جدید" }));
  await user.type(screen.getByLabelText("عنوان فارسی"), "کتاب نمونه");
  await user.type(screen.getByLabelText("کد کتاب"), "sample-1");
  await user.type(screen.getByLabelText("مقطع"), "دبیرستان");
  await user.type(screen.getByLabelText("پایه"), "دهم");
  await user.type(screen.getByLabelText("درس"), "ریاضی");
  await user.type(screen.getByLabelText("سال تحصیلی"), "۱۴۰۵-۱۴۰۶");
  await user.type(screen.getByLabelText("منبع / پدیدآورنده"), "وزارت آموزش و پرورش");
}

describe("TextbooksPage upload and pagination", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    api.fetchTextbooks.mockResolvedValue(response());
    api.fetchTextbookTaxonomies.mockResolvedValue([]);
    api.createTextbook.mockResolvedValue(book);
    api.updateTextbook.mockResolvedValue(book);
    api.uploadTextbook.mockResolvedValue(book);
    api.updateTextbookStatus.mockResolvedValue({ ...book, status: "published" });
    api.deleteTextbook.mockResolvedValue(undefined);
  });

  it("creates a draft, uploads its PDF, then changes publication status", async () => {
    const user = userEvent.setup();
    render(<TextbooksPage />);
    await fillNewBook(user);

    const pdf = new File(["pdf"], "sample.pdf", { type: "application/pdf" });
    await user.upload(screen.getByLabelText("فایل PDF"), pdf);
    await user.selectOptions(screen.getByLabelText("وضعیت"), "published");
    await user.click(screen.getByRole("button", { name: "ذخیره" }));

    await waitFor(() => expect(api.updateTextbookStatus).toHaveBeenCalled());
    expect(api.createTextbook.mock.invocationCallOrder[0]).toBeLessThan(
      api.uploadTextbook.mock.invocationCallOrder[0],
    );
    expect(api.uploadTextbook.mock.invocationCallOrder[0]).toBeLessThan(
      api.updateTextbookStatus.mock.invocationCallOrder[0],
    );
    expect(api.uploadTextbook).toHaveBeenCalledWith("book-1", pdf);
  }, 10000);

  it("replaces an existing PDF before publishing and does not recreate the book", async () => {
    const user = userEvent.setup();
    api.fetchTextbooks.mockResolvedValue(response([book]));
    render(<TextbooksPage />);
    await user.click(await screen.findByRole("button", { name: "ویرایش" }));

    const replacement = new File(["replacement"], "replacement.pdf", {
      type: "application/pdf",
    });
    await user.upload(screen.getByLabelText("فایل PDF"), replacement);
    await user.selectOptions(screen.getByLabelText("وضعیت"), "published");
    await user.click(screen.getByRole("button", { name: "ذخیره" }));

    await waitFor(() => expect(api.updateTextbookStatus).toHaveBeenCalled());
    expect(api.createTextbook).not.toHaveBeenCalled();
    expect(api.updateTextbook.mock.invocationCallOrder[0]).toBeLessThan(
      api.uploadTextbook.mock.invocationCallOrder[0],
    );
    expect(api.uploadTextbook.mock.invocationCallOrder[0]).toBeLessThan(
      api.updateTextbookStatus.mock.invocationCallOrder[0],
    );
    expect(api.uploadTextbook).toHaveBeenCalledWith("book-1", replacement);
  });

  it("reports a create failure and does not start the PDF upload", async () => {
    const user = userEvent.setup();
    api.createTextbook.mockRejectedValueOnce(new Error("create failed"));
    render(<TextbooksPage />);
    await fillNewBook(user);
    await user.upload(
      screen.getByLabelText("فایل PDF"),
      new File(["pdf"], "sample.pdf", { type: "application/pdf" }),
    );
    await user.click(screen.getByRole("button", { name: "ذخیره" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("create failed");
    expect(api.createTextbook).toHaveBeenCalledTimes(1);
    expect(api.uploadTextbook).not.toHaveBeenCalled();
  });

  it("reports an edit failure and does not start the PDF upload", async () => {
    const user = userEvent.setup();
    api.fetchTextbooks.mockResolvedValue(response([book]));
    api.updateTextbook.mockRejectedValueOnce(new Error("edit failed"));
    render(<TextbooksPage />);
    await user.click(await screen.findByRole("button", { name: "ویرایش" }));
    await user.upload(
      screen.getByLabelText("فایل PDF"),
      new File(["replacement"], "replacement.pdf", { type: "application/pdf" }),
    );
    await user.click(screen.getByRole("button", { name: "ذخیره" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("edit failed");
    expect(api.updateTextbook).toHaveBeenCalledTimes(1);
    expect(api.uploadTextbook).not.toHaveBeenCalled();
  });

  it("does not publish after a failed upload and retries without duplicating creation", async () => {
    const user = userEvent.setup();
    api.uploadTextbook
      .mockRejectedValueOnce(new Error("upload failed"))
      .mockResolvedValueOnce(book);
    render(<TextbooksPage />);
    await fillNewBook(user);
    await user.upload(
      screen.getByLabelText("فایل PDF"),
      new File(["pdf"], "sample.pdf", { type: "application/pdf" }),
    );
    await user.selectOptions(screen.getByLabelText("وضعیت"), "published");
    await user.click(screen.getByRole("button", { name: "ذخیره" }));

    const partialSaveAlert = await screen.findByRole("alert");
    expect(partialSaveAlert).toHaveTextContent(
      "اطلاعات کتاب ذخیره شد، اما بارگذاری PDF انجام نشد.",
    );
    expect(partialSaveAlert).toHaveTextContent("upload failed");
    expect(api.updateTextbookStatus).not.toHaveBeenCalled();
    expect(api.createTextbook).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "ذخیره" }));
    await waitFor(() => expect(api.updateTextbookStatus).toHaveBeenCalledTimes(1));
    expect(api.createTextbook).toHaveBeenCalledTimes(1);
    expect(api.updateTextbook).not.toHaveBeenCalled();
    expect(api.uploadTextbook).toHaveBeenCalledTimes(2);
  }, 10000);

  it("reports and retries an edit PDF upload without resaving metadata", async () => {
    const user = userEvent.setup();
    api.fetchTextbooks.mockResolvedValue(response([book]));
    api.uploadTextbook
      .mockRejectedValueOnce(new Error("replacement upload failed"))
      .mockResolvedValueOnce(book);
    render(<TextbooksPage />);
    await user.click(await screen.findByRole("button", { name: "ویرایش" }));
    const replacement = new File(["replacement"], "replacement.pdf", {
      type: "application/pdf",
    });
    await user.upload(screen.getByLabelText("فایل PDF"), replacement);
    await user.click(screen.getByRole("button", { name: "ذخیره" }));

    const partialSaveAlert = await screen.findByRole("alert");
    expect(partialSaveAlert).toHaveTextContent(
      "اطلاعات کتاب ذخیره شد، اما بارگذاری PDF انجام نشد.",
    );
    expect(partialSaveAlert).toHaveTextContent("replacement upload failed");
    expect(api.updateTextbook).toHaveBeenCalledTimes(1);
    expect(api.uploadTextbook).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "ذخیره" }));
    await waitFor(() => expect(api.uploadTextbook).toHaveBeenCalledTimes(2));
    expect(api.uploadTextbook).toHaveBeenLastCalledWith("book-1", replacement);
    expect(api.updateTextbook).toHaveBeenCalledTimes(1);
    expect(api.createTextbook).not.toHaveBeenCalled();
  }, 10000);

  it("loads the next page using the server pagination contract", async () => {
    const user = userEvent.setup();
    const secondBook = { ...book, id: "book-2", title: { fa: "کتاب دوم" } };
    api.fetchTextbooks
      .mockResolvedValueOnce(response([book], 1, 2, 21))
      .mockResolvedValueOnce(response([secondBook], 2, 2, 21));
    render(<TextbooksPage />);

    await screen.findByText("کتاب نمونه");
    await user.click(screen.getByRole("button", { name: "صفحه بعد" }));

    expect(await screen.findByText("کتاب دوم")).toBeInTheDocument();
    await waitFor(() =>
      expect(api.fetchTextbooks).toHaveBeenLastCalledWith(2, 20),
    );
    expect(screen.getByText(/صفحه 2 از 2/)).toBeInTheDocument();
  });

  it("returns to the last valid page after deleting its only book", async () => {
    const user = userEvent.setup();
    const secondBook = { ...book, id: "book-2", title: { fa: "کتاب دوم" } };
    vi.spyOn(window, "confirm").mockReturnValue(true);
    api.fetchTextbooks
      .mockResolvedValueOnce(response([book], 1, 2, 21))
      .mockResolvedValueOnce(response([secondBook], 2, 2, 21))
      .mockResolvedValueOnce(response([], 2, 1, 20))
      .mockResolvedValueOnce(response([book], 1, 1, 20));
    render(<TextbooksPage />);

    await screen.findByText("کتاب نمونه");
    await user.click(screen.getByRole("button", { name: "صفحه بعد" }));
    await screen.findByText("کتاب دوم");
    await user.click(screen.getByRole("button", { name: "حذف" }));

    await waitFor(() => {
      expect(api.deleteTextbook).toHaveBeenCalledWith("book-2");
      expect(api.fetchTextbooks).toHaveBeenCalledTimes(4);
    });
    expect(api.fetchTextbooks).toHaveBeenLastCalledWith(1, 20);
    expect(await screen.findByText("کتاب نمونه")).toBeInTheDocument();
  });
});