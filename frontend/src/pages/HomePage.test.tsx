import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { HomePage } from "./HomePage";

// Mock the data hooks to avoid actual API calls
vi.mock("@/features/static-pages", () => ({
  useHomepage: vi.fn(() => ({
    data: {
      seo: {
        title: "Home",
        description: "Homepage",
      },
      structuredData: null,
    },
  })),
}));

// Mock feature components to simplify testing
vi.mock("@/features/hero", () => ({
  Hero: () => <div data-testid="hero">Hero</div>,
}));

vi.mock("@/features/statistics", () => ({
  HomeStatsBand: () => <div data-testid="stats-band">Stats Band</div>,
}));

vi.mock("@/features/about", () => ({
  HomeAbout: () => <div data-testid="home-about">About</div>,
}));

vi.mock("@/features/campuses", () => ({
  HomeCampuses: () => <div data-testid="home-campuses">Campuses</div>,
}));

vi.mock("@/features/features", () => ({
  Features: () => <div data-testid="features">Features</div>,
}));

vi.mock("@/features/achievements", () => ({
  HomeAchievements: () => <div data-testid="achievements">Achievements</div>,
}));

vi.mock("@/features/news", () => ({
  HomeNews: () => <div data-testid="home-news">News</div>,
}));

vi.mock("@/features/gallery", () => ({
  HomeGallery: () => <div data-testid="home-gallery">Gallery</div>,
}));

vi.mock("@/features/testimonials", () => ({
  Testimonials: () => <div data-testid="testimonials">Testimonials</div>,
}));

vi.mock("@/features/cta", () => ({
  CTA: () => <div data-testid="cta">CTA</div>,
}));

vi.mock("@/shared/seo", () => ({
  Seo: () => <div data-testid="seo" />,
}));

const queryClient = new QueryClient();

function renderHomePage() {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    </QueryClientProvider>,
  );
}

describe("HomePage", () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it("renders without crashing", () => {
    renderHomePage();
    expect(screen.getByTestId("hero")).toBeInTheDocument();
  });

  it("renders all major sections", () => {
    renderHomePage();
    expect(screen.getByTestId("hero")).toBeInTheDocument();
    expect(screen.getByTestId("stats-band")).toBeInTheDocument();
    expect(screen.getByTestId("home-about")).toBeInTheDocument();
    expect(screen.getByTestId("home-campuses")).toBeInTheDocument();
    expect(screen.getByTestId("features")).toBeInTheDocument();
    expect(screen.getByTestId("achievements")).toBeInTheDocument();
    expect(screen.getByTestId("home-news")).toBeInTheDocument();
    expect(screen.getByTestId("home-gallery")).toBeInTheDocument();
    expect(screen.getByTestId("testimonials")).toBeInTheDocument();
    expect(screen.getByTestId("cta")).toBeInTheDocument();
  });

  it("renders SEO component", () => {
    renderHomePage();
    expect(screen.getByTestId("seo")).toBeInTheDocument();
  });

  it("renders homepage sections without constrained page wrappers", () => {
    renderHomePage();
    const hero = screen.getByTestId("hero");
    expect(screen.getByTestId("home-campuses").parentElement).toBe(hero.parentElement);
    expect(screen.getByTestId("home-news").parentElement).toBe(hero.parentElement);
  });
});
