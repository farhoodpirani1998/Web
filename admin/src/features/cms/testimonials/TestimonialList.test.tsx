import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestimonialList } from "./TestimonialList";

describe("TestimonialList", () => {
  it("renders list", () => {
    render(
      <TestimonialList
        testimonials={[]}
        isLoading={false}
        error={null}
        status={undefined}
        updatingStatusId={null}
        isReordering={false}
        isSelected={() => false}
        isAllSelected={false}
        isSelectionIndeterminate={false}
        onToggleSelect={() => {}}
        onToggleSelectAll={() => {}}
        onEdit={() => {}}
        onDeleteRequest={() => {}}
        onChangeStatus={() => {}}
        onToggleFeatured={() => {}}
        onReorder={() => {}}
      />,
    );
    expect(screen.getByRole("table")).toBeInTheDocument();
  });
});
