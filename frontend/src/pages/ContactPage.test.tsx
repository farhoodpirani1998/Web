import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ContactPage } from "./ContactPage";

// Mock feature components
vi.mock("@/features/contact", () => ({
  ContactIntro: () => <div data-testid="contact-intro">Intro</div>,
  ContactInfo: () => <div data-testid="contact-info">Info</div>,
  ContactForm: () => <div data-testid="contact-form">Form</div>,
  ContactSocial: () => <div data-testid="contact-social">Social</div>,
}));

vi.mock("@/shared/design-system/components", () => ({
  PageLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-layout">{children}</div>
  ),
  Stack: ({ children, gap }: { children: React.ReactNode; gap?: string }) => (
    <div data-testid={`stack-${gap}`}>{children}</div>
  ),
}));

const queryClient = new QueryClient();

function renderContactPage() {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ContactPage />
      </BrowserRouter>
    </QueryClientProvider>,
  );
}

describe("ContactPage", () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it("renders without crashing", () => {
    renderContactPage();
    expect(screen.getByTestId("contact-intro")).toBeInTheDocument();
  });

  it("renders contact sections", () => {
    renderContactPage();
    expect(screen.getByTestId("contact-intro")).toBeInTheDocument();
    expect(screen.getByTestId("contact-info")).toBeInTheDocument();
    expect(screen.getByTestId("contact-form")).toBeInTheDocument();
    expect(screen.getByTestId("contact-social")).toBeInTheDocument();
  });

  it("renders PageLayout container", () => {
    renderContactPage();
    expect(screen.getByTestId("page-layout")).toBeInTheDocument();
  });

  it("renders Stack with no gap", () => {
    renderContactPage();
    expect(screen.getByTestId("stack-none")).toBeInTheDocument();
  });
});
