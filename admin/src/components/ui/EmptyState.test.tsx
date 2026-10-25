import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyState } from "./EmptyState";

/**
 * A first component-render smoke test — proves the jsdom + Testing
 * Library + jest-dom wiring works end to end (`vitest.config.ts`,
 * `src/test/setup.ts`). `EmptyState` is a leaf primitive with no
 * providers/router, so it's the simplest thing that exercises JSX.
 */
describe("EmptyState", () => {
  it("renders its title and description", () => {
    render(<EmptyState title="خالی است" description="چیزی برای نمایش نیست." />);

    expect(screen.getByText("خالی است")).toBeInTheDocument();
    expect(screen.getByText("چیزی برای نمایش نیست.")).toBeInTheDocument();
  });

  it("renders a caller-supplied action child", () => {
    render(
      <EmptyState title="خالی">
        <button type="button">ایجاد</button>
      </EmptyState>,
    );

    expect(screen.getByRole("button", { name: "ایجاد" })).toBeInTheDocument();
  });

  it("omits the description when none is given", () => {
    const { container } = render(<EmptyState title="فقط عنوان" />);
    expect(container.querySelectorAll("p")).toHaveLength(0);
  });
});
