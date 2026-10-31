import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TeacherForm } from "./TeacherForm";

describe("TeacherForm", () => {
  it("renders and submits", () => {
    render(<TeacherForm teacher={null} onCancel={() => {}} onSaved={() => {}} />);
    const form = screen.getByRole("form") || document.querySelector("form");
    expect(form).toBeInTheDocument();
    if (form) fireEvent.submit(form);
  });
});
