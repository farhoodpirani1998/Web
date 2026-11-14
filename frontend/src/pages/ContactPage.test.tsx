import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ContactPage } from "./ContactPage";

const { mockUseCampuses } = vi.hoisted(() => ({
  mockUseCampuses: vi.fn(),
}));

vi.mock("@/features/campuses", () => ({
  useCampuses: () => mockUseCampuses(),
}));

vi.mock("@/features/contact/map", () => ({
  SchoolsMap: ({ schools }: { schools: { id: string; name: string }[] }) => (
    <div data-testid="schools-map">{schools.map((school) => school.name).join(", ")}</div>
  ),
}));

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
    mockUseCampuses.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
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

  it("shows loading, error, and empty campus states in Persian", () => {
    mockUseCampuses.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    });
    const { rerender } = renderContactPage();
    expect(screen.getByText("در حال دریافت اطلاعات مدرسه‌ها…")).toBeInTheDocument();

    mockUseCampuses.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    });
    rerender(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ContactPage />
        </BrowserRouter>
      </QueryClientProvider>,
    );
    expect(screen.getByText("دریافت اطلاعات مدرسه‌ها با خطا روبه‌رو شد.")).toBeInTheDocument();

    mockUseCampuses.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    rerender(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ContactPage />
        </BrowserRouter>
      </QueryClientProvider>,
    );
    expect(screen.getByText("هنوز مدرسه‌ای ثبت نشده است.")).toBeInTheDocument();
  });

  it("passes only campuses with both coordinates to the school map", async () => {
    mockUseCampuses.mockReturnValue({
      data: [
        {
          id: "with-coordinates",
          name: "مدرسه دارای مختصات",
          latitude: 35.7,
          longitude: 50.9,
          contact: { phone: "021" },
        },
        {
          id: "without-coordinates",
          name: "مدرسه بدون مختصات",
          latitude: null,
          longitude: null,
          contact: {},
        },
        {
          id: "invalid-coordinates",
          name: "مدرسه با مختصات نامعتبر",
          latitude: 91,
          longitude: 50.9,
          contact: {},
        },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderContactPage();

    expect(await screen.findByTestId("schools-map")).toHaveTextContent("مدرسه دارای مختصات");
    expect(screen.queryByText("مدرسه بدون مختصات")).not.toBeInTheDocument();
    expect(screen.queryByText("مدرسه با مختصات نامعتبر")).not.toBeInTheDocument();
  });
});
