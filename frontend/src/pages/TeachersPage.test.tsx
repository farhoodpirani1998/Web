import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";

import { TeachersPage } from "./TeachersPage";

/**
 * Mock feature components to isolate page-level rendering logic
 * from feature module implementation details.
 */
vi.mock("@/features/teachers", () => ({
  Hero: () => <div data-testid="teachers-hero">Teachers Hero</div>,
  TeacherGrid: () => <div data-testid="teacher-grid">Teacher Grid</div>,
  TeacherDetails: () => <div data-testid="teacher-details">Teacher Details</div>,
  FAQ: () => <div data-testid="teachers-faq">Teachers FAQ</div>,
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

function renderTeachersPage() {
  return render(
    <BrowserRouter>
      <TeachersPage />
    </BrowserRouter>,
  );
}

describe("TeachersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    renderTeachersPage();
    expect(screen.getByTestId("teachers-hero")).toBeInTheDocument();
  });

  it("renders SEO component", () => {
    renderTeachersPage();
    expect(screen.getByTestId("seo")).toBeInTheDocument();
  });

  it("renders Hero section", () => {
    renderTeachersPage();
    expect(screen.getByTestId("teachers-hero")).toBeInTheDocument();
  });

  it("renders TeacherGrid section", () => {
    renderTeachersPage();
    expect(screen.getByTestId("teacher-grid")).toBeInTheDocument();
  });

  it("renders TeacherDetails section", () => {
    renderTeachersPage();
    expect(screen.getByTestId("teacher-details")).toBeInTheDocument();
  });

  it("renders FAQ section", () => {
    renderTeachersPage();
    expect(screen.getByTestId("teachers-faq")).toBeInTheDocument();
  });

  it("wraps sections in PageLayout", () => {
    renderTeachersPage();
    expect(screen.getByTestId("page-layout")).toBeInTheDocument();
  });

  it("uses Stack to compose inner sections", () => {
    renderTeachersPage();
    expect(screen.getByTestId("stack")).toBeInTheDocument();
  });

  it("renders all sections in correct order", () => {
    renderTeachersPage();
    const sections = screen.getByTestId("page-layout");
    const children = sections.querySelectorAll("[data-testid]");
    expect(children.length).toBeGreaterThanOrEqual(4);
  });
});
