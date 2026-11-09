import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FeatureList } from "./FeatureList";

describe("FeatureList", () => {
  it("renders list", () => {
    render(
      <FeatureList
        features={[]}
        isLoading={false}
        error={null}
        status={undefined}
        updatingStatusId={null}
        isReordering={false}
        onEdit={() => {}}
        onDeleteRequest={() => {}}
        onChangeStatus={() => {}}
        onReorder={() => {}}
      />,
    );
    expect(screen.getByRole("table")).toBeInTheDocument();
  });
});
