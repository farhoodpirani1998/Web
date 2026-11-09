import { useCallback, useEffect, useState } from "react";

import { fetchCampusesList } from "../../campuses";
import { fetchEventsList } from "../../events";
import { fetchFeatureList } from "../../features";
import { fetchGalleryList } from "../../gallery";
import { fetchNewsList } from "../../news";
import { fetchSiteSettings } from "../../site-settings";
import { fetchStatisticList } from "../../statistics";
import { fetchTeachersList } from "../../teachers";
import { ROUTE_PATHS } from "@/routes/paths";

export type CompletenessStatus =
  "loading" | "complete" | "incomplete" | "error" | "unsupported";

export interface ContentCompletenessItem {
  id: string;
  label: string;
  description: string;
  href: string;
  status: CompletenessStatus;
}

interface DashboardCompletenessData {
  news: number | null;
  campuses: number | null;
  teachers: number | null;
  gallery: number | null;
  statistics: number | null;
  events: number | null;
  features: number | null;
  mapCoordinates: boolean | null;
}

const EMPTY_DATA: DashboardCompletenessData = {
  news: null,
  campuses: null,
  teachers: null,
  gallery: null,
  statistics: null,
  events: null,
  features: null,
  mapCoordinates: null,
};

function isValidCoordinatePair(latitude?: number | null, longitude?: number | null) {
  return (
    typeof latitude === "number" &&
    Number.isFinite(latitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    typeof longitude === "number" &&
    Number.isFinite(longitude) &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function resultStatus(value: number | boolean | null): ContentCompletenessItem["status"] {
  if (value === null) return "error";
  return value === true || (typeof value === "number" && value > 0)
    ? "complete"
    : "incomplete";
}

export function createContentCompletenessItems(
  data: DashboardCompletenessData,
): ContentCompletenessItem[] {
  return [
    {
      id: "news",
      label: "خبر منتشرشده",
      description: data.news === null ? "" : `${data.news} خبر منتشرشده`,
      href: ROUTE_PATHS.ADMIN_NEWS,
      status: resultStatus(data.news),
    },
    {
      id: "campuses",
      label: "پردیس منتشرشده",
      description: data.campuses === null ? "" : `${data.campuses} پردیس منتشرشده`,
      href: ROUTE_PATHS.ADMIN_CAMPUSES,
      status: resultStatus(data.campuses),
    },
    {
      id: "teachers",
      label: "استاد منتشرشده",
      description: data.teachers === null ? "" : `${data.teachers} استاد منتشرشده`,
      href: ROUTE_PATHS.ADMIN_TEACHERS,
      status: resultStatus(data.teachers),
    },
    {
      id: "gallery",
      label: "مورد منتشرشده در گالری",
      description: data.gallery === null ? "" : `${data.gallery} مورد منتشرشده`,
      href: ROUTE_PATHS.ADMIN_GALLERY,
      status: resultStatus(data.gallery),
    },
    {
      id: "statistics",
      label: "آمار منتشرشده",
      description: data.statistics === null ? "" : `${data.statistics} مورد منتشرشده`,
      href: ROUTE_PATHS.ADMIN_STATISTICS,
      status: resultStatus(data.statistics),
    },
    {
      id: "events",
      label: "رویداد منتشرشده",
      description: data.events === null ? "" : `${data.events} رویداد منتشرشده`,
      href: ROUTE_PATHS.ADMIN_EVENTS,
      status: resultStatus(data.events),
    },
    {
      id: "features",
      label: "ویژگی منتشرشده",
      description: data.features === null ? "" : `${data.features} ویژگی منتشرشده`,
      href: ROUTE_PATHS.ADMIN_FEATURES,
      status: resultStatus(data.features),
    },
    {
      id: "trust-badges",
      label: "نمادهای اعتماد",
      description: "مدیریت نمادهای اعتماد در پنل پشتیبانی نمی‌شود",
      href: ROUTE_PATHS.ADMIN_SETTINGS,
      status: "unsupported",
    },
    {
      id: "map-coordinates",
      label: "مختصات نقشه",
      description:
        data.mapCoordinates === null
          ? ""
          : data.mapCoordinates
            ? "مختصات معتبر ثبت شده است"
            : "طول و عرض جغرافیایی معتبر ثبت نشده است",
      href: ROUTE_PATHS.ADMIN_SETTINGS,
      status: resultStatus(data.mapCoordinates),
    },
  ];
}

export interface UseDashboardCompletenessResult {
  items: ContentCompletenessItem[];
  isLoading: boolean;
  errorCount: number;
  refetch: () => void;
}

export function useDashboardCompleteness(): UseDashboardCompletenessResult {
  const [data, setData] = useState(EMPTY_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [refetchToken, setRefetchToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    Promise.allSettled([
      fetchNewsList("published"),
      fetchCampusesList("published"),
      fetchTeachersList("published"),
      fetchGalleryList("published"),
      fetchStatisticList("published"),
      fetchEventsList("published"),
      fetchFeatureList("published"),
      fetchSiteSettings(),
    ]).then((results) => {
      if (cancelled) return;
      const readCount = <T>(result: PromiseSettledResult<T[]>) =>
        result.status === "fulfilled" ? result.value.length : null;
      const settingsResult = results[7];

      setData({
        news: readCount(results[0]),
        campuses: readCount(results[1]),
        teachers: readCount(results[2]),
        gallery: readCount(results[3]),
        statistics: readCount(results[4]),
        events: readCount(results[5]),
        features: readCount(results[6]),
        mapCoordinates:
          settingsResult.status === "fulfilled"
            ? isValidCoordinatePair(
                settingsResult.value.mapLatitude,
                settingsResult.value.mapLongitude,
              )
            : null,
      });
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [refetchToken]);

  const refetch = useCallback(() => setRefetchToken((token) => token + 1), []);
  const items = createContentCompletenessItems(data);

  return {
    items: isLoading
      ? items.map((item) => ({ ...item, status: "loading" as const }))
      : items,
    isLoading,
    errorCount: isLoading ? 0 : items.filter((item) => item.status === "error").length,
    refetch,
  };
}
