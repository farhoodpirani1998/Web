import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FeatureList } from "./FeatureList";

describe("FeatureList", () => {
  it("renders list", () => {
    render(<FeatureList features={[]} onEdit={() => {}} />);
    expect(screen.getByRole("table")).toBeInTheDocument();
  });
});
