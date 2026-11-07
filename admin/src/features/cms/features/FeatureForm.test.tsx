import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FeatureForm } from "./FeatureForm";

describe("FeatureForm", () => {
  it("renders and submits", () => {
    render(<FeatureForm feature={null} onCancel={() => {}} onSaved={() => {}} />);
    const form = screen.getByRole("form") || document.querySelector("form");
    expect(form).toBeInTheDocument();
    if (form) fireEvent.submit(form);
  });
});
