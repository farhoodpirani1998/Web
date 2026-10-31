import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NewsForm } from "./NewsForm";

describe("NewsForm", () => {
  it("renders and submits", () => {
    render(<NewsForm article={null} onCancel={() => {}} onSaved={() => {}} />);
    const form = screen.getByRole("form") || document.querySelector("form");
    expect(form).toBeInTheDocument();
    if (form) fireEvent.submit(form);
  });
});
