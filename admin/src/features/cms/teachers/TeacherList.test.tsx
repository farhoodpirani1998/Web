import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TeacherList } from "./TeacherList";

describe("TeacherList", () => {
  it("renders list", () => {
    render(<TeacherList teachers={[]} isLoading={false} error={null} status={undefined} updatingStatusId={null} updatingScheduleId={null} isReordering={false} selectedIds={new Set()} onToggleSelect={() => {}} onEdit={() => {}} onDeleteRequest={() => {}} onChangeStatus={() => {}} onSchedule={() => {}} onViewHistory={() => {}} onToggleSelectAll={() => {}} onReorder={() => {}} />);
    expect(screen.getByText(/استادی/)).toBeInTheDocument();
  });
});
