import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EventList } from "./EventList";

describe("EventList", () => {
  it("renders list", () => {
    render(<EventList events={[]} isLoading={false} error={null} onEdit={() => {}} onDeleteRequest={() => {}} />);
    expect(screen.getByText(/هنوز رویدادی نیست/)).toBeInTheDocument();
  });
});
