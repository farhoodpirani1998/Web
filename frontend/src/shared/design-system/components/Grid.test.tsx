import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Grid } from "./Grid";

/**
 * Grid component tests — responsive layout primitive with configurable
 * columns, gaps, and alignment. Tests verify that the component renders
 * children and applies the correct CSS classes for layout control.
 */
describe("Grid", () => {
  it("renders children", () => {
    render(<Grid cols="3"><div>Item</div></Grid>);
    expect(screen.getByText("Item")).toBeInTheDocument();
  });

  it("applies default grid class", () => {
    const { container } = render(<Grid><div>Test</div></Grid>);
    const gridElement = container.querySelector("div");
    expect(gridElement).toHaveClass("grid");
  });

  it("applies cols variant class", () => {
    const { container } = render(<Grid cols="2"><div>Test</div></Grid>);
    const gridElement = container.querySelector("div");
    expect(gridElement).toHaveClass("grid-cols-1", "sm:grid-cols-2");
  });

  it("applies gap variant class", () => {
    const { container } = render(<Grid gap="lg"><div>Test</div></Grid>);
    const gridElement = container.querySelector("div");
    expect(gridElement).toHaveClass("gap-6");
  });

  it("applies alignment variant class", () => {
    const { container } = render(<Grid align="center"><div>Test</div></Grid>);
    const gridElement = container.querySelector("div");
    expect(gridElement).toHaveClass("items-center");
  });

  it("forwards ref correctly", () => {
    const ref = { current: null };
    const { container } = render(
      <Grid ref={ref} cols="3">
        <div>Test</div>
      </Grid>,
    );
    expect(ref.current).toBe(container.querySelector("div"));
  });

  it("accepts custom className", () => {
    const { container } = render(
      <Grid className="custom-class"><div>Test</div></Grid>,
    );
    const gridElement = container.querySelector("div");
    expect(gridElement).toHaveClass("custom-class");
  });

  it("uses custom element with as prop", () => {
    const { container } = render(
      <Grid as="section"><div>Test</div></Grid>,
    );
    expect(container.querySelector("section")).toBeInTheDocument();
  });

  it("renders multiple children", () => {
    render(
      <Grid cols="3">
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </Grid>,
    );
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    expect(screen.getByText("Item 3")).toBeInTheDocument();
  });
});
