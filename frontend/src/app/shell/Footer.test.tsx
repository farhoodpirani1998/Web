import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { useSiteSettingsMock, useTrustBadgesMock, useCampusesMock } = vi.hoisted(() => ({
  useSiteSettingsMock: vi.fn(),
  useTrustBadgesMock: vi.fn(),
  useCampusesMock: vi.fn(),
}));

vi.mock("@/features/site", () => ({
  useSiteSettings: useSiteSettingsMock,
}));
vi.mock("@/features/trust-badges", () => ({
  useTrustBadges: useTrustBadgesMock,
}));
vi.mock("@/features/campuses", () => ({
  useCampuses: useCampusesMock,
}));

import { Footer } from "./Footer";

function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  );
}

describe("Footer trust badges", () => {
  beforeEach(() => {
    useSiteSettingsMock.mockReturnValue({ data: undefined });
    useTrustBadgesMock.mockReturnValue({ data: [] });
    useCampusesMock.mockReturnValue({ data: [] });
  });

  it("does not render a trust badge section when the list is empty", () => {
    renderFooter();
    expect(screen.queryByLabelText("نشان‌های اعتماد")).not.toBeInTheDocument();
  });

  it("renders badges from the public API when present", () => {
    useTrustBadgesMock.mockReturnValue({
      data: [
        {
          id: "badge-1",
          name: { fa: "نشان اعتماد" },
          image: { url: "https://cdn.test/badge.png", altText: "نشان" },
          position: 0,
        },
      ],
    });
    renderFooter();
    expect(screen.getByAltText("نشان")).toHaveAttribute(
      "src",
      "https://cdn.test/badge.png",
    );
  });

  it("links to campus details using the live campus IDs", () => {
    useCampusesMock.mockReturnValue({
      data: [{ id: "campus-uuid", name: "پردیس زنده" }],
    });

    renderFooter();

    expect(screen.getByRole("link", { name: "پردیس زنده" })).toHaveAttribute(
      "href",
      "/campuses#campus-campus-uuid",
    );
  });
});
