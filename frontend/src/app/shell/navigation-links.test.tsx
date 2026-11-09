import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { DesktopNavigation } from "./DesktopNavigation";
import { MobileNavigation } from "./MobileNavigation";
import type { NavLinkItem } from "./DesktopNavigation";

const items: NavLinkItem[] = [
  { id: "email", label: "Email", url: "mailto:hello@example.test" },
  { id: "phone", label: "Phone", url: "tel:+981234567890" },
  { id: "website", label: "Website", url: "https://example.test" },
];

describe("navigation link protocols", () => {
  it("renders mailto and tel links as direct desktop anchors", () => {
    render(
      <MemoryRouter>
        <DesktopNavigation items={items} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Email" })).toHaveAttribute(
      "href",
      "mailto:hello@example.test",
    );
    expect(screen.getByRole("link", { name: "Email" })).not.toHaveAttribute("target");
    expect(screen.getByRole("link", { name: "Phone" })).toHaveAttribute(
      "href",
      "tel:+981234567890",
    );
    expect(screen.getByRole("link", { name: "Phone" })).not.toHaveAttribute("target");
    expect(screen.getByRole("link", { name: "Website" })).toHaveAttribute("target", "_blank");
  });

  it("renders mailto and tel links as direct mobile anchors", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <MobileNavigation items={items} brandName="School" onOpenPortal={vi.fn()} />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "باز کردن منو" }));

    expect(screen.getByRole("link", { name: "Email" })).toHaveAttribute(
      "href",
      "mailto:hello@example.test",
    );
    expect(screen.getByRole("link", { name: "Email" })).not.toHaveAttribute("target");
    expect(screen.getByRole("link", { name: "Phone" })).toHaveAttribute(
      "href",
      "tel:+981234567890",
    );
    expect(screen.getByRole("link", { name: "Phone" })).not.toHaveAttribute("target");
  });
});
