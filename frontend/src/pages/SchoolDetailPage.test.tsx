import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  useCampusBySlugMock,
  newsListMock,
  eventListMock,
  teacherGridMock,
  admissionStepsMock,
  requirementsMock,
  documentsMock,
  tuitionMock,
} = vi.hoisted(() => ({
  useCampusBySlugMock: vi.fn(),
  newsListMock: vi.fn(() => null),
  eventListMock: vi.fn(() => null),
  teacherGridMock: vi.fn(() => null),
  admissionStepsMock: vi.fn(() => null),
  requirementsMock: vi.fn(() => null),
  documentsMock: vi.fn(() => null),
  tuitionMock: vi.fn(() => null),
}));
vi.mock("@/features/campuses", () => ({ useCampusBySlug: useCampusBySlugMock }));
vi.mock("@/features/news", () => ({ NewsList: newsListMock }));
vi.mock("@/features/events", () => ({ EventList: eventListMock }));
vi.mock("@/features/teachers", () => ({ TeacherGrid: teacherGridMock }));
vi.mock("@/features/admissions", () => ({
  AdmissionSteps: admissionStepsMock,
  Requirements: requirementsMock,
  RequiredDocuments: documentsMock,
  TuitionOverview: tuitionMock,
}));

import { ApiError } from "@/shared/api";
import { SchoolDetailPage } from "./SchoolDetailPage";

function renderDetailPage() {
  return render(
    <MemoryRouter initialEntries={["/schools/sample-school"]}>
      <Routes>
        <Route path="/schools/:slug" element={<SchoolDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("SchoolDetailPage", () => {
  beforeEach(() => {
    useCampusBySlugMock.mockReset();
    newsListMock.mockClear();
    eventListMock.mockClear();
    teacherGridMock.mockClear();
    admissionStepsMock.mockClear();
    requirementsMock.mockClear();
    documentsMock.mockClear();
    tuitionMock.mockClear();
  });

  it("renders campus data and scoped school sections", () => {
    useCampusBySlugMock.mockReturnValue({
      data: {
        id: "campus-1",
        title: { fa: "مدرسه نمونه" },
        slug: "sample-school",
        excerpt: { fa: "خلاصه معرفی" },
        body: { fa: "متن معرفی مدرسه" },
        address: { fa: "تهران" },
        phone: "۰۲۱۱۲۳۴۵۶۷۸",
        email: "school@example.test",
        gradeLevels: ["پایه اول"],
        featuredImage: null,
        seo: null,
        structuredData: [],
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    renderDetailPage();

    expect(screen.getByRole("heading", { name: "مدرسه نمونه" })).toBeInTheDocument();
    expect(screen.getByText("متن معرفی مدرسه")).toBeInTheDocument();
    expect(screen.getByText("پایه اول")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "۰۲۱۱۲۳۴۵۶۷۸" })).toHaveAttribute(
      "href",
      "tel:02112345678",
    );
    expect(screen.getByRole("link", { name: "اطلاعات پذیرش" })).toHaveAttribute(
      "href",
      "/admissions",
    );
    expect(newsListMock).toHaveBeenCalledWith({ campusId: "campus-1" }, expect.anything());
    expect(eventListMock).toHaveBeenCalledWith({ campusId: "campus-1" }, expect.anything());
    expect(teacherGridMock).toHaveBeenCalledWith({ campusId: "campus-1" }, expect.anything());
    expect(admissionStepsMock).toHaveBeenCalledWith({ campusId: "campus-1" }, expect.anything());
    expect(requirementsMock).toHaveBeenCalledWith({ campusId: "campus-1" }, expect.anything());
    expect(documentsMock).toHaveBeenCalledWith({ campusId: "campus-1" }, expect.anything());
    expect(tuitionMock).toHaveBeenCalledWith({ campusId: "campus-1" }, expect.anything());
  });

  it("shows a dedicated not-found state for an unknown school", () => {
    useCampusBySlugMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new ApiError("not-found", "not found", 404),
      refetch: vi.fn(),
    });

    renderDetailPage();

    expect(screen.getByRole("heading", { name: "مدرسه یافت نشد" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "بازگشت به فهرست مدارس" })).toHaveAttribute(
      "href",
      "/schools",
    );
  });
});
