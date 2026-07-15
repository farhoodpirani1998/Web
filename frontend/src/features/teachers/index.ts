/**
 * Public surface of the `teachers` feature.
 *
 * Per §30/§32 ("features never reach into another feature's
 * internals"), other layers (pages, other features) import these
 * section components only from here — never from the individual
 * section files directly.
 *
 * `EmptyState` is exported for future wiring (see its own file's
 * doc comment) but is not composed by `TeachersPage` today.
 *
 * `fetchTeachers`/`useTeachers`/`teachersQueryKey` are additive
 * exports, following the same shape `@/features/campuses`'s public
 * surface already exports its fetch layer through.
 */
export { Hero } from "./Hero";
export { TeacherGrid } from "./TeacherGrid";
export { TeacherCard, type TeacherCardProps } from "./TeacherCard";
export { TeacherDetails } from "./TeacherDetails";
export { FAQ } from "./FAQ";
export { EmptyState } from "./EmptyState";
export type { Teacher, TeacherImage } from "./types";
export { teachers } from "./data";
export { fetchTeachers } from "./api";
export { useTeachers, teachersQueryKey } from "./useTeachers";
