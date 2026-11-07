import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Skeleton } from "./skeleton";

/**
 * Skeleton component tests — content-agnostic loading-placeholder
 * primitive. Tests verify that the component renders with correct
 * accessibility attributes, animation classes, and shape variants.
 */
describe("Skeleton", () => {
  it("has animate-pulse class", () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector("div");
    expect(skeleton).toHaveClass("animate-pulse");
  });

  it("has presentation role for accessibility", () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector("div");
    expect(skeleton).toHaveAttribute("role", "presentation");
  });

  it("has aria-hidden true", () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector("div");
    expect(skeleton).toHaveAttribute("aria-hidden", "true");
  });

  it("applies rect shape class by default", () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector("div");
    expect(skeleton).toHaveClass("rounded-md");
  });

  it("applies circle shape class", () => {
    const { container } = render(<Skeleton shape="circle" />);
    const skeleton = container.querySelector("div");
    expect(skeleton).toHaveClass("rounded-full");
  });

  it("applies text shape class", () => {
    const { container } = render(<Skeleton shape="text" />);
    const skeleton = container.querySelector("div");
    expect(skeleton).toHaveClass("h-4", "rounded");
  });

  it("accepts custom className", () => {
    const { container } = render(<Skeleton className="w-32 h-32" />);
    const skeleton = container.querySelector("div");
    expect(skeleton).toHaveClass("w-32", "h-32");
  });

  it("forwards ref correctly", () => {
    const ref = { current: null };
    render(<Skeleton ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("combines shape and custom className", () => {
    const { container } = render(
      <Skeleton shape="circle" className="w-20 h-20" />,
    );
    const skeleton = container.querySelector("div");
    expect(skeleton).toHaveClass("rounded-full", "w-20", "h-20");
  });
});
