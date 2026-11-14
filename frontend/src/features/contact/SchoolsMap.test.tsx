import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mapMocks = vi.hoisted(() => ({
  jumpTo: vi.fn(),
  flyTo: vi.fn(),
  remove: vi.fn(),
  stop: vi.fn(),
  setCenter: vi.fn(),
  addControl: vi.fn(),
  setProjection: vi.fn(),
  throwOnProjection: false,
}));

let motionChangeListener: ((event: MediaQueryListEvent) => void) | undefined;

vi.mock("maplibre-gl", () => {
  class MockMap {
    on(event: string, handler: () => void) {
      if (event === "style.load") queueMicrotask(handler);
      return this;
    }

    once() {
      return this;
    }

    off() {
      return this;
    }

    addControl = mapMocks.addControl;
    flyTo = mapMocks.flyTo;
    jumpTo = mapMocks.jumpTo;
    remove = mapMocks.remove;
    setCenter = mapMocks.setCenter;
    stop = mapMocks.stop;

    setProjection() {
      mapMocks.setProjection();
      if (mapMocks.throwOnProjection) throw new Error("Unsupported projection");
    }
  }

  class MockMarker {
    setLngLat() {
      return this;
    }

    addTo() {
      return this;
    }

    remove() {
      return this;
    }
  }

  class MockPopup {
    setLngLat() {
      return this;
    }

    setDOMContent() {
      return this;
    }

    addTo() {
      return this;
    }

    remove() {
      return this;
    }
  }

  return {
    Map: MockMap,
    Marker: MockMarker,
    NavigationControl: class {},
    Popup: MockPopup,
  };
});

import { SchoolsMap } from "./SchoolsMap";

const schools = [
  { id: "school-1", name: "مدرسه یک", lng: 50.98, lat: 35.72 },
  { id: "school-2", name: "مدرسه دو", lng: 50.99, lat: 35.73 },
];

describe("SchoolsMap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mapMocks.throwOnProjection = false;
    motionChangeListener = undefined;
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn(() => 1),
    );
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: true,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addEventListener: vi.fn((_event, listener) => {
        motionChangeListener = listener as (event: MediaQueryListEvent) => void;
      }),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });
  });

  it("goes to the last school when Previous is clicked before a selection", async () => {
    render(<SchoolsMap schools={schools} styleUrl="https://example.test/style.json" />);

    fireEvent.click(await screen.findByRole("button", { name: "قبلی" }));

    await waitFor(() => {
      expect(mapMocks.jumpTo).toHaveBeenCalledWith({
        center: [schools[1].lng, schools[1].lat],
        zoom: 16,
        pitch: 50,
        bearing: -15,
      });
    });
  });

  it("shows the directory fallback if globe projection setup fails", async () => {
    mapMocks.throwOnProjection = true;

    render(<SchoolsMap schools={schools} styleUrl="https://example.test/style.json" />);

    expect(await screen.findByText(/نقشه در دسترس نیست/)).toBeInTheDocument();
    expect(screen.getByText("مدرسه یک")).toBeInTheDocument();
  });

  it("finishes an active flight immediately when reduced motion is enabled", async () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: false,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addEventListener: vi.fn((_event, listener) => {
        motionChangeListener = listener as (event: MediaQueryListEvent) => void;
      }),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });

    render(<SchoolsMap schools={schools} styleUrl="https://example.test/style.json" />);
    fireEvent.click(await screen.findByRole("button", { name: "بعدی" }));

    await waitFor(() => expect(mapMocks.flyTo).toHaveBeenCalled());
    act(() => {
      motionChangeListener?.({
        matches: true,
        media: "(prefers-reduced-motion: reduce)",
      } as MediaQueryListEvent);
    });

    expect(mapMocks.stop).toHaveBeenCalled();
    expect(mapMocks.jumpTo).toHaveBeenCalledWith({
      center: [schools[0].lng, schools[0].lat],
      zoom: 16,
      pitch: 50,
      bearing: -15,
    });
  });
});
