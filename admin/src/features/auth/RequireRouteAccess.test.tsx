import { render, screen } from "@testing-library/react";
import { createMemoryRouter, Outlet, RouterProvider } from "react-router-dom";
import { describe, expect, it } from "vitest";

import type { AdminPermission, AdminRole } from "@/types/auth";

import { AuthContext } from "./authContext";
import { RequireRouteAccess } from "./RequireRouteAccess";

/**
 * Mounted inside a memory router rather than called directly, because the
 * component's job is to decide between rendering `<Outlet/>` (the page)
 * and its own denial panel — only a real route context shows both halves.
 */
function renderAt(
  pathname: string,
  admin: { role: AdminRole; permissions?: AdminPermission[] },
) {
  const router = createMemoryRouter(
    [
      {
        path: "/admin",
        element: <Outlet />,
        children: [
          {
            element: <RequireRouteAccess />,
            children: [
              { path: "dashboard", element: <div>داشبورد</div> },
              { path: "media", element: <div>کتابخانه رسانه</div> },
              { path: "admin-users", element: <div>کاربران مدیریت</div> },
            ],
          },
        ],
      },
    ],
    { initialEntries: [pathname] },
  );

  return render(
    <AuthContext.Provider
      value={{
        status: "authenticated",
        admin: { id: "a", email: "a@example.com", ...admin },
      }}
    >
      <RouterProvider router={router} />
    </AuthContext.Provider>,
  );
}

const DENIAL_HEADING = "دسترسی به این بخش محدود است";

describe("RequireRouteAccess", () => {
  it("renders the page for a permission the admin holds", () => {
    renderAt("/admin/media", {
      role: "media_manager",
      permissions: ["website.content:read", "website.media:manage"],
    });

    expect(screen.getByText("کتابخانه رسانه")).toBeInTheDocument();
    expect(screen.queryByText(DENIAL_HEADING)).not.toBeInTheDocument();
  });

  it("replaces the page with a denial notice when the permission is missing", () => {
    renderAt("/admin/admin-users", {
      role: "content_editor",
      permissions: ["website.content:read", "website.content:write"],
    });

    expect(screen.queryByText("کاربران مدیریت")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: DENIAL_HEADING })).toBeInTheDocument();
  });

  it("leaves the pages every role can open untouched", () => {
    renderAt("/admin/dashboard", {
      role: "seo_marketing_manager",
      permissions: ["website.content:read", "website.seo:manage"],
    });

    expect(screen.getByText("داشبورد")).toBeInTheDocument();
    expect(screen.queryByText(DENIAL_HEADING)).not.toBeInTheDocument();
  });

  it("offers a way back to the dashboard when denying", () => {
    renderAt("/admin/media", {
      role: "publisher",
      permissions: ["website.content:read"],
    });

    expect(screen.getByRole("link", { name: "بازگشت به داشبورد" })).toHaveAttribute(
      "href",
      "/admin/dashboard",
    );
  });

  it("denies when the session carries no permission list at all", () => {
    renderAt("/admin/media", { role: "website_super_admin" });

    expect(screen.getByRole("heading", { name: DENIAL_HEADING })).toBeInTheDocument();
  });
});
