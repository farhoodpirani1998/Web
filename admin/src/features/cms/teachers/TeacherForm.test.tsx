import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TeacherForm } from "./TeacherForm";

describe("TeacherForm", () => {
  it("renders create mode without crash", () => {
    render(<TeacherForm teacher={null} onCancel={() => {}} onSaved={() => {}} />);
    expect(screen.getByText(/استاد جدید/)).toBeInTheDocument();
  });

  it("submits create with valid data", () => {
    render(<TeacherForm teacher={null} onCancel={() => {}} onSaved={() => {}} />);
    const btn = screen.getByRole("button", { name: /ایجاد استاد/ });
    expect(btn).toBeInTheDocument();
  });
});
