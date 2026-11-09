import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SuccessState } from "./SuccessState";

describe("pre-registration success state", () => {
  it("shows the reference code returned by the API", () => {
    render(<SuccessState referenceCode="NH-2026-1234" />);

    expect(screen.getByText("NH-2026-1234")).toBeInTheDocument();
    expect(screen.getByText("NH-2026-1234")).toHaveAttribute("dir", "ltr");
  });
});
