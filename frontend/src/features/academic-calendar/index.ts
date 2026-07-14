/**
 * Public surface of the `academic-calendar` feature.
 *
 * Per §30/§32 ("features never reach into another feature's
 * internals"), other layers (pages, other features) import these
 * section components only from here — never from the individual
 * section files directly.
 */
export { Hero } from "./Hero";
export { YearOverview } from "./YearOverview";
export { Terms } from "./Terms";
export { Holidays } from "./Holidays";
export { Exams } from "./Exams";
export { ImportantDates } from "./ImportantDates";
export { FAQ } from "./FAQ";
export type {
  AcademicYearStat,
  AcademicTerm,
  Holiday,
  ExamPeriod,
  ImportantDate,
} from "./types";
export { academicYearStats, terms, holidays, examPeriods, importantDates } from "./data";
