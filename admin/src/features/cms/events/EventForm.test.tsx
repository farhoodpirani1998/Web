import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EventForm } from "./EventForm";

describe("EventForm", () => {
  it("renders and submits", () => {
    render(<EventForm event={null} onCancel={() => {}} onSaved={() => {}} />);
    const form = screen.getByRole("form") || document.querySelector("form");
    expect(form).toBeInTheDocument();
    if (form) fireEvent.submit(form);
  });
});
