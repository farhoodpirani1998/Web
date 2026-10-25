/**
 * Types for the CMS Academic Calendar module, mirroring the backend
 * `AcademicCalendarEntry` entity and its DTOs. Same "mirror, don't
 * import" reasoning as `features/cms/faq/types.ts`.
 */

import type { CmsEntityMeta, CmsPublishStatus, Translatable } from "../types";

export type CmsAcademicCalendarStatus = CmsPublishStatus;

/** Mirrors the backend `AcademicCalendarEntryKind` enum. */
export type AcademicCalendarEntryKind =
  | "year_stat"
  | "term"
  | "holiday"
  | "exam_period"
  | "important_date";

export interface CmsAcademicCalendarEntry extends CmsEntityMeta {
  kind: AcademicCalendarEntryKind;
  title: Translatable<string>;
  value?: string;
  dateRange?: string;
  date?: string;
  description?: Translatable<string>;
  position: number;
  status: CmsAcademicCalendarStatus;
}

export interface CreateAcademicCalendarEntryPayload {
  kind: AcademicCalendarEntryKind;
  title: Translatable<string>;
  value?: string;
  dateRange?: string;
  date?: string;
  description?: Translatable<string>;
}

export interface UpdateAcademicCalendarEntryPayload {
  kind?: AcademicCalendarEntryKind;
  title?: Translatable<string>;
  value?: string | null;
  dateRange?: string | null;
  date?: string | null;
  description?: Translatable<string> | null;
}

/** Persian labels for each kind, used by the filter and form. */
export const ACADEMIC_CALENDAR_KIND_LABELS: Record<AcademicCalendarEntryKind, string> = {
  year_stat: "آمار سال",
  term: "نیم‌سال",
  holiday: "تعطیلات",
  exam_period: "دوره امتحانات",
  important_date: "تاریخ مهم",
};
