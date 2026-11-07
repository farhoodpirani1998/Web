import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AboutPage } from "./AboutPage";

// Mock the data hooks
vi.mock("@/features/about", () => ({
  AboutHero: () => <div data-testid="about-hero">Hero</div>,
  AboutStats: () => <div data-testid="about-stats">Stats</div>,
  AboutStory: () => <div data-testid="about-story">Story</div>,
  AboutValues: () => <div data-testid="about-values">Values</div>,
  AboutTimeline: () => <div data-testid="about-timeline">Timeline</div>,
  AboutTeam: () => <div data-testid="about-team">Team</div>,
  AboutFAQ: () => <div data-testid="about-faq">FAQ</div>,
  useAboutPage: vi.fn(() => ({
    data: {
      seo: {
        title: "About",
        description: "About page",
      },
      structuredData: null,
    },
  })),
}));

vi.mock("@/shared/design-system/components", () => ({
  PageLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-layout">{children}</div>
  ),
  Separator: ({ className }: { className?: string }) => (
    <div data-testid="separator" className={className} />
  ),
  Stack: ({ children, gap }: { children: React.ReactNode; gap?: string }) => (
    <div data-testid={`stack-${gap}`}>{children}</div>
  ),
}));

vi.mock("@/shared/seo", () => ({
  Seo: () => <div data-testid="seo" />,
}));

const queryClient = new QueryClient();

function renderAboutPage() {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AboutPage />
      </BrowserRouter>
    </QueryClientProvider>,
  );
}

describe("AboutPage", () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it("renders without crashing", () => {
    renderAboutPage();
    expect(screen.getByTestId("about-hero")).toBeInTheDocument();
  });

  it("renders all about sections", () => {
    renderAboutPage();
    expect(screen.getByTestId("about-hero")).toBeInTheDocument();
    expect(screen.getByTestId("about-stats")).toBeInTheDocument();
    expect(screen.getByTestId("about-story")).toBeInTheDocument();
    expect(screen.getByTestId("about-values")).toBeInTheDocument();
    expect(screen.getByTestId("about-timeline")).toBeInTheDocument();
    expect(screen.getByTestId("about-team")).toBeInTheDocument();
    expect(screen.getByTestId("about-faq")).toBeInTheDocument();
  });

  it("renders SEO component", () => {
    renderAboutPage();
    expect(screen.getByTestId("seo")).toBeInTheDocument();
  });

  it("renders separator between sections", () => {
    renderAboutPage();
    expect(screen.getByTestId("separator")).toBeInTheDocument();
  });

  it("renders PageLayout container", () => {
    renderAboutPage();
    expect(screen.getByTestId("page-layout")).toBeInTheDocument();
  });

  it("renders Stack with no gap", () => {
    renderAboutPage();
    expect(screen.getByTestId("stack-none")).toBeInTheDocument();
  });
});
