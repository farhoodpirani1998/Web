import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NewsList from "./NewsList";

describe("NewsList", () => {
  it("renders list", () => {
    render(<NewsList />);
    expect(screen.getByText(/لیست اخبار/)).toBeInTheDocument();
  });
});
