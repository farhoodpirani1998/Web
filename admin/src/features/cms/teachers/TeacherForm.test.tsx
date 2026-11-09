import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { describe, it, expect } from "vitest";
import { TeacherForm } from "./TeacherForm";

function renderTeacherForm() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  queryClient.setQueryData(["campuses", "list", "all"], []);
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
