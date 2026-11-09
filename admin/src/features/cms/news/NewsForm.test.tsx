import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/ui/PermissionGate", () => ({
  PermissionGate: ({ children }: { children: React.ReactNode }) => children,
}));

import { NewsForm } from "./NewsForm";

describe("NewsForm", () => {
  it("renders inside the data router required by its unsaved-changes guard", () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(["campuses", "list", "all"], []);
    const router = createMemoryRouter(
      [{ path: "/", element: <NewsForm article={null} onCancel={() => {}} onSaved={() => {}} /> }],
      { initialEntries: ["/"] },
    );

    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    );

    expect(screen.getByRole("form", { name: "فرم خبر" })).toBeInTheDocument();
    expect(screen.getByLabelText("پردیس")).toBeInTheDocument();
  });
});
