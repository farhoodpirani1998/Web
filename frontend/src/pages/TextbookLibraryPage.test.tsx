import { createElement, type HTMLAttributes, type ReactNode } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TextbookLibraryPage } from "./TextbookLibraryPage";

const mocks = vi.hoisted(() => ({
  useTextbooks: vi.fn(),
  useTextbookTaxonomies: vi.fn(),
}));

vi.mock("@/features/textbooks", () => mocks);

vi.mock("@/shared/seo", () => ({
  Seo: () => null,
}));

vi.mock("@/shared/design-system/components", () => {
  const Wrapper = ({
    children,
    ...props
  }: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) =>
    createElement("div", props, children);
  return {
    Badge: Wrapper,
    Card: Wrapper,
    CardContent: Wrapper,
    CardHeader: Wrapper,
    CardTitle: Wrapper,
    EmptyState: ({ title, description }: { title: string; description: string }) =>
      createElement("div", null, title, description),
    ErrorState: ({ title, onRetry }: { title: string; onRetry: () => void }) =>
      createElement("div", null, title, createElement("button", { onClick: onRetry })),
    Grid: Wrapper,
    Heading: Wrapper,
    Link: ({ children, href }: { children: ReactNode; href: string }) =>
      createElement("a", { href }, children),
    LoadingState: ({ label }: { label: string }) => createElement("div", null, label),
    MediaFrame: () => null,
    PageLayout: Wrapper,
    Section: Wrapper,
    Stack: Wrapper,
    Text: Wrapper,
  };
});

function LocationDisplay() {
  const location = useLocation();
  return <output data-testid="location-search">{location.search}</output>;
}

function renderLibrary(initialEntry = "/library") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <TextbookLibraryPage />
      <LocationDisplay />
    </MemoryRouter>,
  );
}

const taxonomies = {
  stage: [{ value: "secondary", label: "متوسطه" }],
  grade: [{ value: "10", label: "دهم" }],
  field: [{ value: "science", label: "علوم تجربی" }],
  subject: [{ value: "math", label: "ریاضی" }],
  year: [{ value: "1405", label: "۱۴۰۵" }],
};

const page = {
  items: [],
  meta: { page: 2, limit: 12, total: 40, totalPages: 4 },
};

describe("TextbookLibraryPage", () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    mocks.useTextbooks.mockReturnValue({
      data: page,
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });
    mocks.useTextbookTaxonomies.mockReturnValue({ data: taxonomies });
  });

  it("loads the page and filters from the URL and displays server pagination metadata", () => {
    renderLibrary(
      "/library?page=2&q=algebra&stage=secondary&grade=10&field=science&subject=math&year=1405&sort=title&order=DESC",
    );

    expect(mocks.useTextbooks).toHaveBeenCalledWith({
      page: 2,
      q: "algebra",
      stage: "secondary",
      grade: "10",
      field: "science",
      subject: "math",
      year: "1405",
      sort: "title",
      order: "DESC",
    });
    expect(screen.getByRole("searchbox", { name: "جست‌وجو در کتاب‌ها" })).toHaveValue(
      "algebra",
    );
    expect(screen.getByText("صفحه 2 از 4 · 40 کتاب")).toBeInTheDocument();
  });

  it("updates a taxonomy filter in the URL and resets pagination", () => {
    renderLibrary("/library?page=3&stage=secondary");

    fireEvent.change(screen.getByRole("combobox", { name: "پایه" }), {
      target: { value: "10" },
    });

    const params = new URLSearchParams(screen.getByTestId("location-search").textContent);
    expect(params.get("grade")).toBe("10");
    expect(params.get("page")).toBeNull();
  });

  it("debounces search before updating the URL and resets pagination", () => {
    vi.useFakeTimers();
    renderLibrary("/library?page=3");

    fireEvent.change(screen.getByRole("searchbox", { name: "جست‌وجو در کتاب‌ها" }), {
      target: { value: "biology" },
    });

    expect(screen.getByTestId("location-search")).toHaveTextContent("page=3");
    act(() => vi.advanceTimersByTime(349));
    expect(screen.getByTestId("location-search")).toHaveTextContent("page=3");
    act(() => vi.advanceTimersByTime(1));

    const params = new URLSearchParams(screen.getByTestId("location-search").textContent);
    expect(params.get("q")).toBe("biology");
    expect(params.get("page")).toBeNull();
  });
});
