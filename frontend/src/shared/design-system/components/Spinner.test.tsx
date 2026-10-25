import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Spinner } from "./Spinner";

/**
 * First component-render smoke test — proves the jsdom + Testing Library
 * + jest-dom wiring works end to end (`vitest.config.ts`, `src/test/setup.ts`).
 * `Spinner` is a provider-free leaf primitive, so it's the simplest real
 * component that exercises JSX + the design-system `cn` helper.
 */
describe("Spinner", () => {
  it("exposes a status role for assistive technology", () => {
    render(<Spinner />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("defaults its accessible label to «Loading»", () => {
    render(<Spinner />);
    expect(screen.getByText("Loading")).toBeInTheDocument();
  });

  it("uses a caller-supplied label", () => {
    render(<Spinner label="در حال بارگذاری" />);
    expect(screen.getByText("در حال بارگذاری")).toBeInTheDocument();
  });
});
