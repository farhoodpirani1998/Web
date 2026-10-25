/**
 * Types for the CMS Admissions module, mirroring the backend
 * `AdmissionEntry` entity + DTOs. Same "mirror, don't import" reasoning as
 * `features/cms/faq/types.ts`.
 */

import type { CmsEntityMeta, CmsPublishStatus, Translatable } from "../types";

export type CmsAdmissionStatus = CmsPublishStatus;

/** Mirrors the backend `AdmissionEntryKind` enum. */
export type AdmissionEntryKind = "step" | "requirement" | "required_document" | "tuition_plan";

export interface CmsAdmissionEntry extends CmsEntityMeta {
  kind: AdmissionEntryKind;
  title: Translatable<string>;
  value?: string;
  description?: Translatable<string>;
  price?: string;
  period?: string;
  includes?: string[];
  position: number;
  status: CmsAdmissionStatus;
}

export interface CreateAdmissionEntryPayload {
  kind: AdmissionEntryKind;
  title: Translatable<string>;
  value?: string;
  description?: Translatable<string>;
  price?: string;
  period?: string;
  includes?: string[];
}

export interface UpdateAdmissionEntryPayload {
  kind?: AdmissionEntryKind;
  title?: Translatable<string>;
  value?: string | null;
  description?: Translatable<string> | null;
  price?: string | null;
  period?: string | null;
  includes?: string[] | null;
}

export const ADMISSION_KIND_LABELS: Record<AdmissionEntryKind, string> = {
  step: "مرحله",
  requirement: "شرط پذیرش",
  required_document: "مدرک لازم",
  tuition_plan: "طرح شهریه",
};
