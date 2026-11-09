import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { EventForm } from "./EventForm";

describe("EventForm", () => {
  it("renders and submits", () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(["campuses", "list", "all"], []);
    render(
      <QueryClientProvider client={queryClient}>
        <EventForm event={null} onCancel={() => {}} onSaved={() => {}} />
      </QueryClientProvider>,
    );
    const form = screen.queryByRole("form") ?? document.querySelector("form");
    expect(form).toBeInTheDocument();
    expect(screen.getByLabelText("پردیس")).toBeInTheDocument();
    if (form) fireEvent.submit(form);
  });
});
