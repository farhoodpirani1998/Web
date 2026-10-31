import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestimonialList } from "./TestimonialList";

describe("TestimonialList", () => {
  it("renders list", () => {
    render(<TestimonialList testimonials={[]} isLoading={false} error={null} onEdit={() => {}} />);
    expect(screen.getByRole("table")).toBeInTheDocument();
  });
});
