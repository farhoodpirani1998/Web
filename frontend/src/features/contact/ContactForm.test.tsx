import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { submitMock } = vi.hoisted(() => ({ submitMock: vi.fn() }));
vi.mock("./api", () => ({ submitContactMessage: submitMock }));

import { ContactForm } from "./ContactForm";

describe("ContactForm", () => {
  beforeEach(() => {
    submitMock.mockReset();
  });

  it("submits a validated message and announces success", async () => {
    submitMock.mockResolvedValue(undefined);
    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText("نام و نام خانوادگی"), {
      target: { value: "نگار رضایی" },
    });
    fireEvent.change(screen.getByLabelText("شمارهٔ تماس"), {
      target: { value: "۰۹۱۲۳۴۵۶۷۸۹" },
    });
    fireEvent.change(screen.getByLabelText("موضوع پیام"), {
      target: { value: "course-information" },
    });
    fireEvent.change(screen.getByLabelText("متن پیام"), {
      target: { value: "دربارهٔ دوره‌ها راهنمایی می‌خواستم." },
    });
    fireEvent.click(screen.getByRole("button", { name: "ارسال پیام" }));

    await waitFor(() => {
      expect(submitMock).toHaveBeenCalledWith({
        fullName: "نگار رضایی",
        phone: "09123456789",
        subject: "course-information",
        message: "دربارهٔ دوره‌ها راهنمایی می‌خواستم.",
      });
    });
    expect(await screen.findByRole("status")).toHaveTextContent(
      "پیامت با موفقیت ارسال شد. به‌زودی باهات در ارتباط خواهیم بود.",
    );
  });

  it("shows a clear error for an invalid phone without submitting", () => {
    render(<ContactForm />);
    fireEvent.change(screen.getByLabelText("نام و نام خانوادگی"), {
      target: { value: "نگار رضایی" },
    });
    fireEvent.change(screen.getByLabelText("شمارهٔ تماس"), {
      target: { value: "شماره نامعتبر" },
    });
    fireEvent.change(screen.getByLabelText("موضوع پیام"), {
      target: { value: "other" },
    });
    fireEvent.change(screen.getByLabelText("متن پیام"), {
      target: { value: "سؤال" },
    });
    fireEvent.click(screen.getByRole("button", { name: "ارسال پیام" }));

    expect(screen.getByRole("alert")).toHaveTextContent("شمارهٔ تماس معتبر");
    expect(submitMock).not.toHaveBeenCalled();
  });
});
