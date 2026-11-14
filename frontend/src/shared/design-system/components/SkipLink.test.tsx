import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { SkipLink } from "./SkipLink";

describe("SkipLink", () => {
  it("is the first keyboard target and points to the main landmark", async () => {
    const user = userEvent.setup();

    render(
      <>
        <SkipLink />
        <header>
          <a href="/">Home</a>
        </header>
        <main id="main-content">Page content</main>
      </>,
    );

    const skipLink = screen.getByRole("link", { name: "Skip to main content" });
    expect(skipLink).toHaveAttribute("href", "#main-content");
    expect(document.querySelector(skipLink.getAttribute("href")!)).toBeInTheDocument();

    await user.tab();

    expect(skipLink).toHaveFocus();
  });
});
