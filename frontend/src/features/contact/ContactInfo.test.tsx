import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { settingsMock } = vi.hoisted(() => ({ settingsMock: vi.fn() }));
vi.mock("@/features/site", () => ({ useSiteSettings: settingsMock }));

import { ContactInfo } from "./ContactInfo";

describe("ContactInfo", () => {
  beforeEach(() => {
    settingsMock.mockReset();
  });

  it("renders only configured contact details and working hours", () => {
    settingsMock.mockReturnValue({
      data: {
        address: { fa: "تهران، خیابان نمونه" },
        contactPhones: ["021-12345678"],
        contactEmail: "hello@nedaye.example",
        workingHours: [
          {
            day: "saturday",
            openTime: "09:00",
            closeTime: "16:00",
            isClosed: false,
          },
        ],
      },
    });

    render(<ContactInfo />);

    expect(screen.getByText("تهران، خیابان نمونه")).toBeInTheDocument();
    expect(screen.getByText("۰۲۱-۱۲۳۴۵۶۷۸")).toBeInTheDocument();
    expect(screen.getByText("hello@nedaye.example")).toBeInTheDocument();
    expect(screen.getByText("شنبه")).toBeInTheDocument();
    expect(screen.getByText("09:00 تا 16:00")).toBeInTheDocument();
    expect(screen.queryByText(/نمونه، پلاک/)).not.toBeInTheDocument();
  });

  it("does not render a contact section when no real details exist", () => {
    settingsMock.mockReturnValue({ data: undefined });
    const { container } = render(<ContactInfo />);
    expect(container.firstChild).toBeNull();
  });
});
