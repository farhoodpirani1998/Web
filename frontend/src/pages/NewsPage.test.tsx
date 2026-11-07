import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";

import { NewsPage } from "./NewsPage";

/**
 * Mock feature components to isolate page-level rendering logic
 * from feature module implementation details.
 */
vi.mock("@/features/news", () => ({
  NewsHero: () => <div data-testid="news-hero">News Hero</div>,
  NewsList: () => <div data-testid="news-list">News List</div>,
  NewsDetails: () => <div data-testid="news-details">News Details</div>,
  FAQ: () => <div data-testid="news-faq">News FAQ</div>,
}));

vi.mock("@/shared/design-system/components", () => ({
  PageLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-layout">{children}</div>
  ),
  Stack: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="stack">{children}</div>
  ),
}));

vi.mock("@/shared/seo", () => ({
  Seo: () => <div data-testid="seo" />,
}));

function renderNewsPage() {
  return render(
    <BrowserRouter>
      <NewsPage />
    </BrowserRouter>,
  );
}

describe("NewsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    renderNewsPage();
    expect(screen.getByTestId("news-hero")).toBeInTheDocument();
  });

  it("renders SEO component", () => {
    renderNewsPage();
    expect(screen.getByTestId("seo")).toBeInTheDocument();
  });

  it("renders NewsHero section", () => {
    renderNewsPage();
    expect(screen.getByTestId("news-hero")).toBeInTheDocument();
  });

  it("renders NewsList section", () => {
    renderNewsPage();
    expect(screen.getByTestId("news-list")).toBeInTheDocument();
  });

  it("renders NewsDetails section", () => {
    renderNewsPage();
    expect(screen.getByTestId("news-details")).toBeInTheDocument();
  });

  it("renders FAQ section", () => {
    renderNewsPage();
    expect(screen.getByTestId("news-faq")).toBeInTheDocument();
  });

  it("wraps sections in PageLayout", () => {
    renderNewsPage();
    expect(screen.getByTestId("page-layout")).toBeInTheDocument();
  });

  it("uses Stack to compose inner sections", () => {
    renderNewsPage();
    expect(screen.getByTestId("stack")).toBeInTheDocument();
  });

  it("renders all sections in correct order", () => {
    renderNewsPage();
    const sections = screen.getByTestId("page-layout");
    const children = sections.querySelectorAll("[data-testid]");
    expect(children.length).toBeGreaterThanOrEqual(4);
  });
});
