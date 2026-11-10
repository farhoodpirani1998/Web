import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EventForm } from "./EventForm";

vi.mock("@/features/cms/campuses", () => ({
  CampusSelect: ({ id, label }: { id: string; label: string }) => (
    <label htmlFor={id}>
      {label}
      <select id={id} />
    </label>
  ),
}));

vi.mock("./api", () => ({
  createCalendarEvent: vi.fn(),
  updateCalendarEvent: vi.fn(),
}));

describe("EventForm", () => {
  it("renders and submits", () => {
    render(<EventForm event={null} onCancel={() => {}} onSaved={() => {}} />);
    const form = screen.queryByRole("form") ?? document.querySelector("form");
    expect(form).toBeInTheDocument();
    expect(screen.getByLabelText("پردیس")).toBeInTheDocument();
    if (form) fireEvent.submit(form);
  });
});
