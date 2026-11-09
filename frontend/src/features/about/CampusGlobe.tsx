import { useMemo, useState } from "react";
import { ArrowUpLeft, MapPin, Navigation } from "lucide-react";

import { Image, Link, Text } from "@/shared/design-system/components";
import type { Campus } from "@/features/campuses";
import "./CampusGlobe.css";

interface CampusGlobeProps {
  campuses: readonly Campus[];
  isLoading: boolean;
  hasError: boolean;
}

interface CampusMarker {
  campus: Campus;
  x: number;
  y: number;
}

export function CampusGlobe({ campuses, isLoading, hasError }: CampusGlobeProps) {
  const [selectedCampusId, setSelectedCampusId] = useState<string | null>(null);
  const markers = useMemo(() => makeMarkers(campuses), [campuses]);
  const selectedCampus = campuses.find((campus) => campus.id === selectedCampusId);

  return (
    <div className="campus-globe" role="region" aria-label="موقعیت پردیس‌های مجموعه">
      <div className="campus-globe__scene">
        <div className="campus-globe__eyebrow">
          <span className="campus-globe__eyebrow-dot" aria-hidden="true" />
          <span>از نزدیک‌تر بشناسید</span>
        </div>

        <div
          className="campus-globe__orbit campus-globe__orbit--one"
          aria-hidden="true"
        />
        <div
          className="campus-globe__orbit campus-globe__orbit--two"
          aria-hidden="true"
        />
        <div className="campus-globe__planet" aria-hidden="true">
          <div className="campus-globe__land">
            <svg viewBox="0 0 520 360" focusable="false">
              <path d="m104 71 27-16 31 5 18 18-12 17-28 4-10 18-24-9-11-18-20-5 3-10 26-4Zm64 54 20 9 10 20-8 22-18 17-8 28-17 1-9-29-15-16 5-24 18-11 5-17Zm73-79 32-13 30 9 16 15-8 13-27 4-13 18-24 1-10-12-21-3-7-17 32-15Zm59 74 17-17 23 3 12 16-8 18-22 8-7 23-19 6-14-19 7-20-14-5Zm67-41 22-10 24 6 8 15-17 13-23-4-14-10Zm-17 108 21-8 16 13-3 20-19 14-21-9-9-16 15-14Z" />
            </svg>
          </div>
          <div className="campus-globe__latitude" />
          <div className="campus-globe__longitude" />
          <div className="campus-globe__shine" />
        </div>

        <div className="campus-globe__destination" aria-hidden="true">
          <MapPin className="h-4 w-4" />
          <span>فردیس، البرز</span>
        </div>

        {markers.map(({ campus, x, y }) => (
          <button
            key={campus.id}
            type="button"
            className="campus-globe__marker"
            style={{ left: `${x}%`, top: `${y}%` }}
            onClick={() => setSelectedCampusId(campus.id)}
            aria-label={`نمایش اطلاعات ${campus.name}`}
            aria-pressed={campus.id === selectedCampusId}
            title={campus.name}
          >
            <span className="campus-globe__marker-pulse" aria-hidden="true" />
            <span className="campus-globe__marker-dot" aria-hidden="true" />
          </button>
        ))}

        <div className="campus-globe__caption">
          <span className="campus-globe__caption-line" aria-hidden="true" />
          <span>رد پای آموزش در فردیس</span>
        </div>
      </div>

      <div className="campus-globe__content" dir="rtl">
        {isLoading ? (
          <Text role="status" variant="bodySm" color="muted" align="center">
            در حال دریافت موقعیت پردیس‌ها…
          </Text>
        ) : hasError ? (
          <Text role="alert" variant="bodySm" color="muted" align="center">
            دریافت موقعیت پردیس‌ها ممکن نشد.
          </Text>
        ) : campuses.length === 0 ? (
          <Text variant="bodySm" color="muted" align="center">
            هنوز پردیسی برای نمایش ثبت نشده است.
          </Text>
        ) : (
          <>
            <div className="campus-globe__campus-list" aria-label="انتخاب پردیس">
              {campuses.map((campus) => (
                <button
                  key={campus.id}
                  type="button"
                  className="campus-globe__campus-chip"
                  onClick={() => setSelectedCampusId(campus.id)}
                  aria-pressed={campus.id === selectedCampusId}
                >
                  <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {campus.name}
                </button>
              ))}
            </div>

            {selectedCampus ? (
              <CampusLocationCard campus={selectedCampus} />
            ) : (
              <p className="campus-globe__hint">
                برای دیدن عکس و نشانی، یکی از نشان‌های نقشه یا نام پردیس را انتخاب کنید.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function CampusLocationCard({ campus }: { campus: Campus }) {
  const destination =
    campus.latitude != null && campus.longitude != null
      ? `${campus.latitude},${campus.longitude}`
      : [campus.name, campus.address].filter(Boolean).join("، ");
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
  const neshanMapsUrl = getNeshanUrl(campus, destination);

  return (
    <article className="campus-globe__card" aria-live="polite">
      <div className="campus-globe__card-image">
        {campus.image.src ? (
          <Image
            src={campus.image.src}
            alt={campus.image.alt}
            fit="cover"
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <MapPin className="h-8 w-8 text-brand-gold" aria-hidden="true" />
        )}
      </div>

      <div className="campus-globe__card-body">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-heading text-base font-bold text-foreground">
              {campus.name}
            </h3>
            {campus.address ? (
              <p className="mt-1 text-xs leading-6 text-muted-foreground">
                {campus.address}
              </p>
            ) : (
              <p className="mt-1 text-xs leading-6 text-muted-foreground">
                نشانی برای این پردیس ثبت نشده است.
              </p>
            )}
          </div>
          <span className="campus-globe__card-pin" aria-hidden="true">
            <MapPin className="h-4 w-4" />
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={neshanMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="campus-globe__map-link"
          >
            <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
            مسیریابی با نشان
            <ArrowUpLeft className="h-3 w-3" aria-hidden="true" />
          </Link>
          <Link
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="campus-globe__map-link campus-globe__map-link--secondary"
          >
            <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
            Google Maps
            <ArrowUpLeft className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function makeMarkers(campuses: readonly Campus[]): CampusMarker[] {
  const located = campuses.filter(hasCoordinates);
  if (!located.length) return [];

  const latitudes = located.map((campus) => campus.latitude);
  const longitudes = located.map((campus) => campus.longitude);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);

  return located.map((campus) => ({
    campus,
    x:
      minLongitude === maxLongitude
        ? 50
        : 24 + ((campus.longitude - minLongitude) / (maxLongitude - minLongitude)) * 52,
    y:
      minLatitude === maxLatitude
        ? 53
        : 31 + ((maxLatitude - campus.latitude) / (maxLatitude - minLatitude)) * 35,
  }));
}

function hasCoordinates(
  campus: Campus,
): campus is Campus & { latitude: number; longitude: number } {
  return (
    campus.latitude != null &&
    campus.longitude != null &&
    Number.isFinite(campus.latitude) &&
    Number.isFinite(campus.longitude)
  );
}

function getNeshanUrl(campus: Campus, destination: string): string {
  if (campus.mapUrl) {
    try {
      const mapUrl = new URL(campus.mapUrl);
      if (
        mapUrl.protocol === "https:" &&
        (mapUrl.hostname === "neshan.org" ||
          mapUrl.hostname.endsWith(".neshan.org") ||
          mapUrl.hostname === "nshn.ir")
      ) {
        return mapUrl.toString();
      }
    } catch {
      // Fall back to a search link when the optional CMS URL is malformed.
    }
  }

  if (campus.latitude != null && campus.longitude != null) {
    return `https://neshan.org/maps?lat=${campus.latitude}&lng=${campus.longitude}&zoom=16`;
  }

  return `https://neshan.org/maps?query=${encodeURIComponent(destination)}`;
}
