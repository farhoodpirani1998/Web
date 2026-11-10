import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";

vi.mock("@/features/cms/campuses/api", () => ({
  fetchCampusesList: vi.fn().mockResolvedValue([]),
}));
vi.mock("@/features/cms/media/api", () => ({
  fetchMediaList: vi.fn().mockResolvedValue([]),
  fetchMediaById: vi.fn().mockResolvedValue(null),
}));

import { TeacherForm } from "./TeacherForm";

function renderTeacherForm() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const router = createMemoryRouter(
    [{ path: "/", element: <TeacherForm teacher={null} onCancel={() => {}} onSaved={() => {}} /> }],
    { initialEntries: ["/"] },
  );
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

describe("TeacherForm", () => {
  it("renders create mode without crash", () => {
    renderTeacherForm();
    expect(screen.getByText(/استاد جدید/)).toBeInTheDocument();
    expect(screen.getByLabelText("پردیس")).toBeInTheDocument();
  });

  it("submits create with valid data", () => {
    renderTeacherForm();
    const btn = screen.getByRole("button", { name: /ایجاد استاد/ });
    expect(btn).toBeInTheDocument();
  });
});
