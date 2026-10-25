import { apiClient } from "@/shared/api";

import type {
  AcademicYearStat,
  AcademicTerm,
  ExamPeriod,
  Holiday,
  ImportantDate,
  PublicAcademicCalendarEntryDto,
} from "./types";

/**
 * Request functions for the `academic-calendar` feature's Public API
 * endpoint (`GET /public/academic-calendar`).
 *
 * Only this file is aware of the endpoint's URL. The backend stores
 * every section's rows in one table with a `kind` discriminator, so
 * `fetchAcademicCalendar` groups the flat response into the five lists
 * each section component renders — the shape `./data`'s literals
 * already had.
 */

export interface AcademicCalendar {
  yearStats: readonly AcademicYearStat[];
  terms: readonly AcademicTerm[];
  holidays: readonly Holiday[];
  examPeriods: readonly ExamPeriod[];
  importantDates: readonly ImportantDate[];
}

export async function fetchAcademicCalendar(): Promise<AcademicCalendar> {
  const response = await apiClient.get<PublicAcademicCalendarEntryDto[]>("/academic-calendar");
  const entries = response.data;

  const byKind = (kind: string) => entries.filter((entry) => entry.kind === kind);

  return {
    yearStats: byKind("year_stat").map((entry) => ({
      id: entry.id,
      value: entry.value ?? "",
      label: entry.title.fa,
    })),
    terms: byKind("term").map((entry) => ({
      id: entry.id,
      order: entry.value ?? "",
      title: entry.title.fa,
      dateRange: entry.dateRange ?? "",
      description: entry.description?.fa ?? "",
    })),
    holidays: byKind("holiday").map((entry) => ({
      id: entry.id,
      name: entry.title.fa,
      date: entry.date ?? "",
      description: entry.description?.fa ?? "",
    })),
    examPeriods: byKind("exam_period").map((entry) => ({
      id: entry.id,
      title: entry.title.fa,
      dateRange: entry.dateRange ?? "",
      description: entry.description?.fa ?? "",
    })),
    importantDates: byKind("important_date").map((entry) => ({
      id: entry.id,
      title: entry.title.fa,
      date: entry.date ?? "",
      description: entry.description?.fa ?? "",
    })),
  };
}
