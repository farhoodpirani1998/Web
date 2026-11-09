import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFeature } from "./api";
import { FeatureForm } from "./FeatureForm";

vi.mock("./api", () => ({
  createFeature: vi.fn(),
  updateFeature: vi.fn(),
}));

describe("FeatureForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a feature with the form payload and returns the saved entity", async () => {
    const savedFeature = {
      id: "feature-1",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      title: { fa: "آموزش دو زبانه" },
      description: { fa: "برنامه آموزشی دو زبانه" },
      position: 0,
      status: "draft" as const,
    };
    vi.mocked(createFeature).mockResolvedValue(savedFeature);
    const onSaved = vi.fn();

    render(<FeatureForm feature={null} onCancel={() => {}} onSaved={onSaved} />);
    fireEvent.change(screen.getByLabelText("عنوان فارسی"), { target: { value: "آموزش دو زبانه" } });
    fireEvent.change(screen.getByLabelText("توضیح فارسی"), { target: { value: "برنامه آموزشی دو زبانه" } });
    fireEvent.click(screen.getByRole("button", { name: "ذخیره" }));

    await waitFor(() => {
      expect(createFeature).toHaveBeenCalledWith({
        title: { fa: "آموزش دو زبانه" },
        description: { fa: "برنامه آموزشی دو زبانه" },
      });
    });
    expect(onSaved).toHaveBeenCalledWith(savedFeature);
  });
});
