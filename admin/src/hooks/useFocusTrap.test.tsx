import { fireEvent, render, screen } from "@testing-library/react";
import { useRef, useState } from "react";
import { describe, expect, it } from "vitest";

import { useFocusTrap } from "./useFocusTrap";

function FocusTrapDemo() {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, isOpen, () => setIsOpen(false));

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        باز کردن
      </button>
      {isOpen ? (
        <div ref={dialogRef} role="dialog" aria-modal="true" tabIndex={-1}>
          <button type="button">اول</button>
          <button type="button">آخر</button>
        </div>
      ) : null}
    </>
  );
}

describe("useFocusTrap", () => {
  it("traps Tab navigation and restores focus when the dialog closes", () => {
    render(<FocusTrapDemo />);

    const trigger = screen.getByRole("button", { name: "باز کردن" });
    trigger.focus();
    fireEvent.click(trigger);

    const first = screen.getByRole("button", { name: "اول" });
    const last = screen.getByRole("button", { name: "آخر" });
    expect(document.activeElement).toBe(first);

    fireEvent.keyDown(first, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
    fireEvent.keyDown(last, { key: "Tab" });
    expect(document.activeElement).toBe(first);

    fireEvent.keyDown(first, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.activeElement).toBe(trigger);
  });
});
