import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { settingsMock } = vi.hoisted(() => ({ settingsMock: vi.fn() }));
vi.mock("@/features/site", () => ({ useSiteSettings: settingsMock }));

import { ContactSocial } from "./ContactSocial";

describe("ContactSocial", () => {
  beforeEach(() => {
    settingsMock.mockReset();
  });

  it("shows active channels only", () => {
    settingsMock.mockReturnValue({
      data: {
        socialLinks: [
          { platform: "instagram", url: "https://instagram.com/group", active: true },
          { platform: "telegram", url: "https://t.me/group", active: false },
        ],
      },
    });

    render(<ContactSocial />);

    expect(screen.getByText("اینستاگرام")).toBeInTheDocument();
    expect(screen.queryByText("تلگرام")).not.toBeInTheDocument();
  });

  it("omits the section if no active channel is configured", () => {
    settingsMock.mockReturnValue({
      data: {
        socialLinks: [
          { platform: "instagram", url: "https://instagram.com/group", active: false },
        ],
      },
    });
    const { container } = render(<ContactSocial />);
    expect(container.firstChild).toBeNull();
  });
});
