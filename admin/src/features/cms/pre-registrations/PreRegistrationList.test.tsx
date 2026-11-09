import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PreRegistrationList } from "./PreRegistrationList";
import type { CmsPreRegistration } from "./types";

vi.mock("@/components/ui/PermissionGate", () => ({
  PermissionGate: ({ children }: { children: React.ReactNode }) => children,
}));

const registrations: CmsPreRegistration[] = [
  {
    id: "one",
    createdAt: "2026-10-13T10:00:00.000Z",
    updatedAt: "2026-10-13T10:00:00.000Z",
    referenceCode: "PR-2026-0001",
    studentFirstName: "علی",
    studentLastName: "محمدی",
    studentNationalId: "1234567891",
    studentBirthDate: "2015-01-01",
    studentGrade: "grade-1",
    guardianFullName: "رضا محمدی",
    guardianPhone: "09121234567",
    status: "new",
  },
  {
    id: "two",
    createdAt: "2026-10-20T10:00:00.000Z",
    updatedAt: "2026-10-20T10:00:00.000Z",
    studentFirstName: "سارا",
    studentLastName: "رضایی",
    studentNationalId: "9876543210",
    studentBirthDate: "2014-01-01",
    studentGrade: "grade-7",
    guardianFullName: "مینا رضایی",
    guardianPhone: "09991234567",
    status: "contacted",
  },
];

function renderList() {
  return render(
    <PreRegistrationList
      preRegistrations={registrations}
      isLoading={false}
      error={null}
      updatingStatusId={null}
      onDeleteRequest={vi.fn()}
      onViewDetail={vi.fn()}
      onChangeStatus={vi.fn()}
    />,
  );
}

describe("PreRegistrationList", () => {
  it("shows Persian grade labels and Persian-calendar submission dates", () => {
    renderList();
    expect(screen.getByText("PR-2026-0001")).toBeInTheDocument();
    expect(screen.getAllByText("پایه اول ابتدایی").length).toBeGreaterThan(0);
    expect(screen.getAllByText("پایه هفتم").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/۱۴۰۵/).length).toBe(2);
  }, 20_000);

  it("filters by Persian-digit national ID search", () => {
    renderList();
    fireEvent.change(screen.getByRole("textbox", { name: "جستجوی پیش‌ثبت‌نام" }), {
      target: { value: "۱۲۳۴۵۶۷۸۹۱" },
    });
    expect(screen.getByText("علی محمدی")).toBeInTheDocument();
    expect(screen.queryByText("سارا رضایی")).not.toBeInTheDocument();
  }, 20_000);

  it("finds a submission by its reference code", () => {
    renderList();
    fireEvent.change(screen.getByRole("textbox", { name: "جستجوی پیش‌ثبت‌نام" }), {
      target: { value: "PR-2026-0001" },
    });
    expect(screen.getByText("علی محمدی")).toBeInTheDocument();
    expect(screen.queryByText("سارا رضایی")).not.toBeInTheDocument();
  }, 20_000);

  it("filters by grade and registration-date range", () => {
    renderList();
    fireEvent.change(screen.getByRole("combobox", { name: "فیلتر بر اساس پایه" }), {
      target: { value: "grade-7" },
    });
    fireEvent.change(screen.getByLabelText("از تاریخ ثبت"), {
      target: { value: "2026-10-15" },
    });
    const table = screen.getByRole("table");
    expect(within(table).getByText("سارا رضایی")).toBeInTheDocument();
    expect(within(table).queryByText("علی محمدی")).not.toBeInTheDocument();
  }, 20_000);
});
