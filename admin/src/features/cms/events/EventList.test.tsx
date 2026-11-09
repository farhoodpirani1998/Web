import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EventList } from "./EventList";

describe("EventList", () => {
  it("renders list", () => {
    render(
      <EventList
        events={[]}
        isLoading={false}
        error={null}
        updatingStatusId={null}
        updatingScheduleId={null}
        onEdit={() => {}}
        onDeleteRequest={() => {}}
        onChangeStatus={() => {}}
        onSchedule={() => {}}
        onViewHistory={() => {}}
      />,
    );
    expect(screen.getByText(/هنوز رویدادی نیست/)).toBeInTheDocument();
  });
});
