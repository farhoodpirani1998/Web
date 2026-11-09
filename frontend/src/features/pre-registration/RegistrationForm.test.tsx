import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { useCampusesMock, submitMock } = vi.hoisted(() => ({
  useCampusesMock: vi.fn(),
  submitMock: vi.fn(),
}));
vi.mock("@/features/campuses", () => ({ useCampuses: useCampusesMock }));
vi.mock("./api", () => ({ submitPreRegistration: submitMock }));

import { RegistrationForm } from "./RegistrationForm";

function fillRequiredFields() {
  fireEvent.change(document.getElementById("student-first-name")!, {
    target: { value: "آرمان" },
  });
  fireEvent.change(document.getElementById("student-last-name")!, {
    target: { value: "نمونه" },
  });
  fireEvent.change(document.getElementById("student-national-id")!, {
    target: { value: "1234567891" },
  });
  fireEvent.change(document.getElementById("student-birth-date")!, {
    target: { value: "2015-01-01" },
  });
  fireEvent.change(document.getElementById("student-grade")!, {
    target: { value: "grade-1" },
  });
  fireEvent.change(document.getElementById("guardian-full-name")!, {
    target: { value: "والد نمونه" },
  });
  fireEvent.change(document.getElementById("guardian-phone")!, {
    target: { value: "09123456789" },
  });
}

describe("RegistrationForm campus selection", () => {
  beforeEach(() => {
    submitMock.mockReset();
    useCampusesMock.mockReturnValue({
      data: [{ id: "campus-1", name: "مدرسه نمونه" }],
    });
  });

  it("does not require a campus and submits null by default", async () => {
    submitMock.mockResolvedValue({ id: "registration-1", referenceCode: "NH-001" });
    render(<RegistrationForm />);

    expect(screen.getByLabelText("مدرسه یا پردیس (اختیاری)")).not.toBeRequired();
    fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: "ثبت پیش‌ثبت‌نام" }));

    await waitFor(() => {
      expect(submitMock).toHaveBeenCalledWith(
        expect.objectContaining({ campusId: null }),
      );
    });
    expect(await screen.findByText("NH-001")).toBeInTheDocument();
  });

  it("submits a selected campus id", async () => {
    submitMock.mockResolvedValue({ id: "registration-1", referenceCode: "NH-002" });
    render(<RegistrationForm />);

    fireEvent.change(screen.getByLabelText("مدرسه یا پردیس (اختیاری)"), {
      target: { value: "campus-1" },
    });
    fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: "ثبت پیش‌ثبت‌نام" }));

    await waitFor(() => {
      expect(submitMock).toHaveBeenCalledWith(
        expect.objectContaining({ campusId: "campus-1" }),
      );
    });
  });
});
