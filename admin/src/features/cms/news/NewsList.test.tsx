import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NewsList from "./NewsList";

describe("NewsList", () => {
  it("renders list", () => {
    render(
      <NewsList
        articles={[]}
        isLoading={false}
        error={null}
        updatingStatusId={null}
        updatingScheduleId={null}
        isSelected={() => false}
        isAllSelected={false}
        isSelectionIndeterminate={false}
        onToggleSelect={() => undefined}
        onToggleSelectAll={() => undefined}
        onEdit={() => undefined}
        onDeleteRequest={() => undefined}
        onChangeStatus={() => undefined}
        onSchedule={() => undefined}
        onViewHistory={() => undefined}
      />,
    );
    expect(screen.getByText(/لیست اخبار/)).toBeInTheDocument();
  });
});
