import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CmsCampus } from "./types";

vi.mock("@/features/cms/media", () => ({
  MediaPicker: () => null,
}));

vi.mock("@/hooks/useFocusTrap", () => ({
  useFocusTrap: () => {},
}));

vi.mock("@/hooks/useUnsavedChangesGuard", () => ({
  useUnsavedChangesGuard: () => ({
    isConfirmOpen: false,
    guardedAction: (action: () => void) => action(),
    confirmLeave: () => {},
    cancelLeave: () => {},
  }),
}));

vi.mock("./api", () => ({
  createCampus: vi.fn(),
  updateCampus: vi.fn(),
}));

import { createCampus, updateCampus } from "./api";
import { CampusForm } from "./CampusForm";

const savedCampus: CmsCampus = {
  id: "campus-id",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  title: { fa: "پردیس مرکزی" },
  slug: "central-campus",
  body: { fa: "توضیحات" },
  latitude: 35.7219,
  longitude: 51.3347,
  position: 0,
  seo: { noindex: false },
  status: "draft",
};

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText("عنوان (فارسی)"), {
    target: { value: "پردیس مرکزی" },
  });
  fireEvent.change(screen.getByLabelText("نامک"), {
    target: { value: "central-campus" },
  });
  fireEvent.change(screen.getByLabelText("متن (فارسی)"), {
    target: { value: "توضیحات" },
  });
}

describe("CampusForm map coordinates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("explains Google Maps coordinate order and submits numeric create values", async () => {
    vi.mocked(createCampus).mockResolvedValue(savedCampus);
    render(<CampusForm campus={null} onCancel={() => {}} onSaved={() => {}} />);

    expect(
      screen.getByText(
        "از Google Maps مختصات را کپی کنید، عدد اول عرض و عدد دوم طول است",
      ),
    ).toBeInTheDocument();
    fillRequiredFields();
    fireEvent.change(screen.getByLabelText("عرض جغرافیایی (−۹۰ تا ۹۰)"), {
      target: { value: "35.7219" },
    });
    fireEvent.change(screen.getByLabelText("طول جغرافیایی (−۱۸۰ تا ۱۸۰)"), {
      target: { value: "51.3347" },
    });
    fireEvent.submit(screen.getByRole("form", { name: "فرم پردیس" }));

    await waitFor(() => {
      expect(createCampus).toHaveBeenCalledWith(
        expect.objectContaining({ latitude: 35.7219, longitude: 51.3347 }),
      );
    });
  });

  it("loads coordinates for editing and previews zero-valued latitude correctly", async () => {
    vi.mocked(updateCampus).mockResolvedValue(savedCampus);
    render(<CampusForm campus={savedCampus} onCancel={() => {}} onSaved={() => {}} />);

    const latitude = screen.getByLabelText("عرض جغرافیایی (−۹۰ تا ۹۰)");
    const longitude = screen.getByLabelText("طول جغرافیایی (−۱۸۰ تا ۱۸۰)");
    expect(latitude).toHaveValue(35.7219);
    expect(longitude).toHaveValue(51.3347);
    fireEvent.change(latitude, { target: { value: "0" } });
    fireEvent.change(longitude, { target: { value: "51.5" } });
    expect(screen.getByTitle("موقعیت پردیس")).toHaveAttribute(
      "src",
      "https://www.google.com/maps?q=0,51.5&output=embed",
    );
    fireEvent.submit(screen.getByRole("form", { name: "فرم پردیس" }));

    await waitFor(() => {
      expect(updateCampus).toHaveBeenCalledWith(
        savedCampus.id,
        expect.objectContaining({ latitude: 0, longitude: 51.5 }),
      );
    });
  });

  it("clears one coordinate without changing the other", async () => {
    vi.mocked(updateCampus).mockResolvedValue(savedCampus);
    render(<CampusForm campus={savedCampus} onCancel={() => {}} onSaved={() => {}} />);

    fireEvent.change(screen.getByLabelText("عرض جغرافیایی (−۹۰ تا ۹۰)"), {
      target: { value: "" },
    });
    fireEvent.submit(screen.getByRole("form", { name: "فرم پردیس" }));

    await waitFor(() => {
      expect(updateCampus).toHaveBeenCalledWith(
        savedCampus.id,
        expect.objectContaining({ latitude: null, longitude: 51.3347 }),
      );
    });
  });

  it("blocks saving out-of-range coordinates", async () => {
    render(<CampusForm campus={null} onCancel={() => {}} onSaved={() => {}} />);
    fillRequiredFields();
    fireEvent.change(screen.getByLabelText("عرض جغرافیایی (−۹۰ تا ۹۰)"), {
      target: { value: "90.01" },
    });
    fireEvent.submit(screen.getByRole("form", { name: "فرم پردیس" }));

    expect(
      await screen.findByText("عرض جغرافیایی باید بین ۹۰- و ۹۰ باشد"),
    ).toBeInTheDocument();
    expect(createCampus).not.toHaveBeenCalled();
  });
});
