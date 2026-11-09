import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Campus } from "@/features/campuses";
import { CampusGlobe } from "./CampusGlobe";

const campus: Campus = {
  id: "campus-1",
  slug: "fardis-primary",
  name: "دبستان ندای حقیقت",
  description: "آموزش در محیطی پویا",
  detailedDescription: "آموزش در محیطی پویا",
  address: "فردیس، خیابان نمونه",
  latitude: 35.72,
  longitude: 50.98,
  contact: {},
  image: { alt: "نمای پردیس" },
};

describe("CampusGlobe", () => {
  it("opens a campus card with navigation links when its name is selected", () => {
    render(<CampusGlobe campuses={[campus]} isLoading={false} hasError={false} />);

    fireEvent.click(screen.getByRole("button", { name: campus.name }));

    expect(screen.getByRole("heading", { name: campus.name })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /مسیریابی با نشان/ })).toHaveAttribute(
      "href",
      "https://neshan.org/maps?lat=35.72&lng=50.98&zoom=16",
    );
    expect(screen.getByRole("link", { name: /Google Maps/ })).toHaveAttribute(
      "href",
      "https://www.google.com/maps/dir/?api=1&destination=35.72%2C50.98",
    );
  });

  it("shows loading and API errors instead of hiding them", () => {
    const { rerender } = render(<CampusGlobe campuses={[]} isLoading hasError={false} />);
    expect(screen.getByRole("status")).toHaveTextContent("در حال دریافت موقعیت پردیس‌ها");

    rerender(<CampusGlobe campuses={[]} isLoading={false} hasError />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "دریافت موقعیت پردیس‌ها ممکن نشد",
    );
  });
});
