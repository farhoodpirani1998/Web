import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const api = vi.hoisted(() => ({
  fetchCampusesList: vi.fn(),
  fetchEventsList: vi.fn(),
  fetchFeatureList: vi.fn(),
  fetchGalleryList: vi.fn(),
  fetchNewsList: vi.fn(),
  fetchSiteSettings: vi.fn(),
  fetchStatisticList: vi.fn(),
  fetchTeachersList: vi.fn(),
}));

vi.mock("../campuses", () => ({ fetchCampusesList: api.fetchCampusesList }));
vi.mock("../events", () => ({ fetchEventsList: api.fetchEventsList }));
vi.mock("../features", () => ({ fetchFeatureList: api.fetchFeatureList }));
vi.mock("../gallery", () => ({ fetchGalleryList: api.fetchGalleryList }));
vi.mock("../news", () => ({ fetchNewsList: api.fetchNewsList }));
vi.mock("../site-settings", () => ({ fetchSiteSettings: api.fetchSiteSettings }));
vi.mock("../statistics", () => ({ fetchStatisticList: api.fetchStatisticList }));
vi.mock("../teachers", () => ({ fetchTeachersList: api.fetchTeachersList }));

import { DashboardContentCompleteness } from "./DashboardContentCompleteness";

function renderWidget() {
  return render(
    <MemoryRouter>
      <DashboardContentCompleteness />
    </MemoryRouter>,
  );
}

function resolveAllTo(items: unknown[] = [{ id: "published" }]) {
  api.fetchNewsList.mockResolvedValue(items);
  api.fetchCampusesList.mockResolvedValue(items);
  api.fetchTeachersList.mockResolvedValue(items);
  api.fetchGalleryList.mockResolvedValue(items);
  api.fetchStatisticList.mockResolvedValue(items);
  api.fetchEventsList.mockResolvedValue(items);
  api.fetchFeatureList.mockResolvedValue(items);
  api.fetchSiteSettings.mockResolvedValue(
    items.length ? { mapLatitude: 35.7, mapLongitude: 51.4 } : {},
  );
}

describe("DashboardContentCompleteness", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resolveAllTo();
  });

  it("shows loading state, then completion results linked to CMS sections", async () => {
    let resolveNews!: (value: unknown[]) => void;
    api.fetchNewsList.mockReturnValue(new Promise((resolve) => (resolveNews = resolve)));

    renderWidget();
    expect(screen.getByText("در حال بررسی بخش‌ها")).toBeInTheDocument();

    resolveNews([{ id: "published" }]);
    await waitFor(() =>
      expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100"),
    );

    expect(screen.getByRole("link", { name: /خبر منتشرشده/ })).toHaveAttribute(
      "href",
      "/admin/news",
    );
    expect(screen.getByRole("link", { name: /پردیس منتشرشده/ })).toHaveAttribute(
      "href",
      "/admin/campuses",
    );
    expect(screen.getByRole("link", { name: /استاد منتشرشده/ })).toHaveAttribute(
      "href",
      "/admin/teachers",
    );
    expect(screen.getByRole("link", { name: /مورد منتشرشده در گالری/ })).toHaveAttribute(
      "href",
      "/admin/gallery",
    );
    expect(screen.getByRole("link", { name: /آمار منتشرشده/ })).toHaveAttribute(
      "href",
      "/admin/statistics",
    );
    expect(screen.getByRole("link", { name: /رویداد منتشرشده/ })).toHaveAttribute(
      "href",
      "/admin/events",
    );
    expect(screen.getByRole("link", { name: /ویژگی منتشرشده/ })).toHaveAttribute(
      "href",
      "/admin/features",
    );
    expect(screen.getByRole("link", { name: /مختصات نقشه/ })).toHaveAttribute(
      "href",
      "/admin/settings",
    );
    expect(screen.getByText("نمادهای اعتماد")).toBeInTheDocument();
    expect(screen.getByText("قابل بررسی نیست")).toBeInTheDocument();
  });

  it("distinguishes empty sections from fetch errors and offers retry", async () => {
    resolveAllTo([]);
    api.fetchNewsList.mockRejectedValue(new Error("network"));

    renderWidget();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "دریافت اطلاعات ۱ بخش ناموفق بود",
    );
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
    expect(screen.getByRole("link", { name: /خبر منتشرشده/ })).toHaveTextContent(
      "دریافت ناموفق",
    );
    expect(screen.getByRole("link", { name: /پردیس منتشرشده/ })).toHaveTextContent(
      "نیازمند محتوا",
    );
    expect(api.fetchNewsList).toHaveBeenCalledWith("published");

    api.fetchNewsList.mockResolvedValue([]);
    fireEvent.click(screen.getByRole("button", { name: /تلاش دوباره/ }));
    await waitFor(() => expect(api.fetchNewsList).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
  });
});
