import { useCallback, useEffect, useRef, useState } from "react";
import {
  Map as MapLibreMap,
  Marker as MapLibreMarker,
  NavigationControl,
  Popup as MapLibrePopup,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { env } from "@/shared/config/env";

import "./SchoolsMap.css";

export interface SchoolPoint {
  id: string;
  name: string;
  lng: number;
  lat: number;
  address?: string;
  phone?: string;
}

interface SchoolsMapProps {
  schools: readonly SchoolPoint[];
  /** مرکز شهر فردیس به ترتیب [lng, lat]. */
  cityCenter?: [number, number];
  styleUrl?: string;
  height?: number | string;
}

const IRAN: [number, number] = [53.7, 32.4];
const KARAJ: [number, number] = [50.99, 35.83];
const FARDIS_DEFAULT: [number, number] = [50.9891563, 35.7316704];

export function SchoolsMap({
  schools,
  cityCenter = FARDIS_DEFAULT,
  styleUrl = env.mapStyleUrl,
  height = "clamp(22rem, 65vh, 35rem)",
}: SchoolsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<MapLibreMarker[]>([]);
  const popupRef = useRef<MapLibrePopup | null>(null);
  const schoolsRef = useRef(schools);
  const runIdRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerResolverRef = useRef<(() => void) | null>(null);
  const pendingMoveRef = useRef<{
    finish: () => void;
    target: { center: [number, number]; zoom: number; pitch: number; bearing: number };
  } | null>(null);
  const spinRef = useRef(false);
  const userMovedRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const [mapStatus, setMapStatus] = useState<"loading" | "ready" | "unavailable">(
    "loading",
  );
  const [activeSchool, setActiveSchool] = useState(-1);
  const [playing, setPlaying] = useState(false);

  schoolsRef.current = schools;

  const stopTour = useCallback(() => {
    runIdRef.current += 1;
    setPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    timerResolverRef.current?.();
    timerResolverRef.current = null;
    mapRef.current?.stop();
    pendingMoveRef.current?.finish();
  }, []);

  const fly = useCallback(
    (center: [number, number], zoom: number, pitch = 0, bearing = 0) => {
      const map = mapRef.current;
      if (!map) return Promise.resolve();

      const target = { center, zoom, pitch, bearing };
      if (reducedMotionRef.current) {
        map.jumpTo(target);
        return Promise.resolve();
      }

      return new Promise<void>((resolve) => {
        const finish = () => {
          map.off("moveend", finish);
          if (pendingMoveRef.current?.finish === finish) pendingMoveRef.current = null;
          resolve();
        };
        pendingMoveRef.current = { finish, target };
        map.once("moveend", finish);
        map.flyTo({ ...target, speed: 0.8, curve: 1.5 });
      });
    },
    [],
  );

  const showPopup = useCallback((school: SchoolPoint) => {
    const map = mapRef.current;
    if (!map) return;

    const content = document.createElement("div");
    content.className = "schools-map__popup";
    content.dir = "rtl";

    const title = document.createElement("strong");
    title.textContent = school.name;
    content.append(title);

    if (school.address) {
      const address = document.createElement("div");
      address.textContent = school.address;
      content.append(address);
    }

    if (school.phone) {
      const phone = document.createElement("div");
      phone.dir = "ltr";
      phone.textContent = school.phone;
      content.append(phone);
    }

    popupRef.current?.remove();
    popupRef.current = new MapLibrePopup({
      offset: 18,
      closeButton: false,
      maxWidth: "min(280px, calc(100vw - 32px))",
    })
      .setLngLat([school.lng, school.lat])
      .setDOMContent(content)
      .addTo(map);
  }, []);

  const focusSchool = useCallback(
    async (index: number) => {
      const school = schoolsRef.current[index];
      if (!school) return;

      userMovedRef.current = true;
      spinRef.current = false;
      setActiveSchool(index);
      await fly([school.lng, school.lat], 16, 50, -15);
      showPopup(school);
    },
    [fly, showPopup],
  );

  useEffect(() => {
    if (!styleUrl || !containerRef.current) {
      setMapStatus("unavailable");
      return;
    }

    let styleLoaded = false;
    let longitude = 20;
    let lastFrameTime = 0;
    let map: MapLibreMap;
    const motionPreference = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    );
    reducedMotionRef.current = motionPreference?.matches ?? false;
    spinRef.current = !reducedMotionRef.current;

    const stopSpin = () => {
      userMovedRef.current = true;
      spinRef.current = false;
    };

    const animateGlobe = (time: number) => {
      if (!mapRef.current || !spinRef.current || reducedMotionRef.current) {
        rafRef.current = null;
        return;
      }

      const elapsed = lastFrameTime ? Math.min(time - lastFrameTime, 100) : 0;
      longitude = (longitude + elapsed * 0.003) % 360;
      lastFrameTime = time;
      map.setCenter([longitude, 25]);
      rafRef.current = requestAnimationFrame(animateGlobe);
    };

    const startSpin = () => {
      if (rafRef.current === null && spinRef.current) {
        lastFrameTime = 0;
        rafRef.current = requestAnimationFrame(animateGlobe);
      }
    };

    const handleMotionChange = (event: MediaQueryListEvent) => {
      reducedMotionRef.current = event.matches;
      if (event.matches) {
        spinRef.current = false;
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        const pendingMove = pendingMoveRef.current;
        if (pendingMove) {
          map.stop();
          map.jumpTo(pendingMove.target);
          pendingMove.finish();
        }
      } else if (styleLoaded && !userMovedRef.current) {
        spinRef.current = true;
        startSpin();
      }
    };

    try {
      map = new MapLibreMap({
        container: containerRef.current,
        style: styleUrl,
        center: [20, 25],
        zoom: 1.4,
        attributionControl: { compact: true },
      });
    } catch {
      setMapStatus("unavailable");
      return;
    }

    mapRef.current = map;
    map.addControl(new NavigationControl({ showCompass: false }), "top-left");

    let mapRemoved = false;
    const removeMap = () => {
      if (!mapRemoved) {
        map.remove();
        mapRemoved = true;
      }
    };
    const handleStyleError = () => {
      spinRef.current = false;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      if (mapRef.current === map) mapRef.current = null;
      removeMap();
      setMapStatus("unavailable");
    };

    map.on("error", () => {
      if (!styleLoaded) handleStyleError();
    });
    map.on("mousedown", stopSpin);
    map.on("touchstart", stopSpin);
    map.on("style.load", () => {
      try {
        map.setProjection({ type: "globe" });
      } catch {
        handleStyleError();
        return;
      }
      styleLoaded = true;
      setMapStatus("ready");
      startSpin();
    });

    motionPreference?.addEventListener("change", handleMotionChange);

    return () => {
      motionPreference?.removeEventListener("change", handleMotionChange);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      timerResolverRef.current?.();
      timerResolverRef.current = null;
      pendingMoveRef.current?.finish();
      popupRef.current?.remove();
      popupRef.current = null;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      runIdRef.current += 1;
      removeMap();
      mapRef.current = null;
    };
  }, [styleUrl]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || mapStatus !== "ready") return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = schools.map((school, index) => {
      const element = document.createElement("button");
      element.type = "button";
      element.className = "schools-map__marker";
      element.setAttribute("aria-label", `نمایش ${school.name}`);
      element.addEventListener("click", () => {
        stopTour();
        void focusSchool(index);
      });

      return new MapLibreMarker({ element })
        .setLngLat([school.lng, school.lat])
        .addTo(map);
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [focusSchool, mapStatus, schools, stopTour]);

  useEffect(() => {
    stopTour();
    setActiveSchool(-1);
    popupRef.current?.remove();
  }, [schools, stopTour]);

  const wait = (duration: number) =>
    new Promise<void>((resolve) => {
      timerResolverRef.current = resolve;
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        timerResolverRef.current = null;
        resolve();
      }, duration);
    });

  const startTour = async () => {
    if (!schools.length || mapStatus !== "ready") return;

    const runId = ++runIdRef.current;
    const tourSchools = schools;
    const isCurrentRun = () => runIdRef.current === runId;
    userMovedRef.current = true;
    spinRef.current = false;
    setPlaying(true);
    popupRef.current?.remove();

    await fly(IRAN, 4.5);
    if (!isCurrentRun()) return;
    await fly(KARAJ, 9);
    if (!isCurrentRun()) return;
    await fly(cityCenter, 12.5);
    if (!isCurrentRun()) return;

    for (let index = 0; index < tourSchools.length; index += 1) {
      await focusSchool(index);
      if (!isCurrentRun()) return;
      await wait(3500);
      if (!isCurrentRun()) return;
      popupRef.current?.remove();
      await fly(cityCenter, 13);
      if (!isCurrentRun()) return;
    }

    setPlaying(false);
  };

  const step = (direction: 1 | -1) => {
    if (!schools.length) return;
    stopTour();
    const next =
      activeSchool === -1
        ? direction === 1
          ? 0
          : schools.length - 1
        : (activeSchool + direction + schools.length) % schools.length;
    void focusSchool(next);
  };

  if (mapStatus === "unavailable") {
    return (
      <div className="schools-map__fallback" dir="rtl" style={{ minHeight: height }}>
        <p className="text-sm text-muted-foreground">
          نقشه در دسترس نیست؛ برای مسیریابی از پیوند هر مدرسه استفاده کنید.
        </p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {schools.map((school) => (
            <li
              key={school.id}
              className="rounded-md border border-border bg-card p-4 text-card-foreground"
            >
              <h3 className="font-semibold">{school.name}</h3>
              {school.address && <p className="mt-1 text-sm">{school.address}</p>}
              {school.phone && (
                <a className="mt-1 block text-sm text-primary" href={`tel:${school.phone}`}>
                  {school.phone}
                </a>
              )}
              <a
                className="mt-3 inline-flex min-h-11 items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground"
                href={`https://www.google.com/maps/dir/?api=1&destination=${school.lat},${school.lng}`}
                target="_blank"
                rel="noreferrer"
              >
                مسیریابی
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div
      className="schools-map"
      style={{ height }}
      aria-label="نقشه و تور مدرسه‌ها"
      dir="rtl"
    >
      <div ref={containerRef} className="schools-map__canvas" />
      {mapStatus === "loading" && (
        <div className="schools-map__loading" role="status">
          در حال بارگذاری نقشه…
        </div>
      )}
      <div className="schools-map__controls">
        <button
          type="button"
          className="schools-map__button schools-map__button--secondary"
          onClick={() => step(-1)}
          disabled={!schools.length}
        >
          قبلی
        </button>
        {playing ? (
          <button
            type="button"
            className="schools-map__button schools-map__button--primary"
            onClick={stopTour}
          >
            توقف
          </button>
        ) : (
          <button
            type="button"
            className="schools-map__button schools-map__button--primary"
            onClick={() => void startTour()}
            disabled={mapStatus !== "ready" || !schools.length}
          >
            شروع تور مدرسه‌ها
          </button>
        )}
        <button
          type="button"
          className="schools-map__button schools-map__button--secondary"
          onClick={() => step(1)}
          disabled={!schools.length}
        >
          بعدی
        </button>
      </div>
    </div>
  );
}
