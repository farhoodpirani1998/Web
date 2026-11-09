import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { PortalModal } from "./PortalModal";

describe("PortalModal focus management", () => {
  it("keeps Tab navigation inside the dialog", () => {
    render(
      <MemoryRouter>
        <PortalModal open onClose={vi.fn()} />
      </MemoryRouter>,
    );

    const closeButton = screen.getByRole("button", { name: "بستن" });
    const lastPortalLink = screen.getByRole("link", {
      name: /با پشتیبانی فناوری اطلاعات تماس بگیرید/,
    });

    lastPortalLink.focus();
    fireEvent.keyDown(lastPortalLink, { key: "Tab" });
    expect(closeButton).toHaveFocus();

    fireEvent.keyDown(closeButton, { key: "Tab", shiftKey: true });
    expect(lastPortalLink).toHaveFocus();
  });

  it("restores focus to the trigger when closed", () => {
    const trigger = document.createElement("button");
    trigger.textContent = "Open portal";
    document.body.appendChild(trigger);
    trigger.focus();

    const { rerender } = render(
      <MemoryRouter>
        <PortalModal open onClose={vi.fn()} />
      </MemoryRouter>,
    );
    rerender(
      <MemoryRouter>
        <PortalModal open={false} onClose={vi.fn()} />
      </MemoryRouter>,
    );

    expect(trigger).toHaveFocus();
    trigger.remove();
  });
});
