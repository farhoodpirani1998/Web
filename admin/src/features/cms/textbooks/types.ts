import type { CmsEntityMeta, CmsPublishStatus } from "../types";

export type CmsTextbookStatus = CmsPublishStatus;
export type CmsTextbookSourceType = "UPLOADED" | "EXTERNAL_LINK";
export type CmsTextbookTaxonomyType = "stage" | "grade" | "field" | "subject";

export interface CmsTextbook extends CmsEntityMeta {
  title: { fa: string; en?: string };
  slug: string;
  code: string;
  stage: string;
  grade: string;
  field: string | null;
  subject: string;
  academicYear: string;
  sourceType: CmsTextbookSourceType;
  externalUrl: string | null;
  sourceAttribution: string;
  status: CmsTextbookStatus;
}

export interface CmsTextbookTaxonomy {
  id: string;
  type: CmsTextbookTaxonomyType;
  value: string;
  label: string;
  sortOrder: number;
}

export interface TextbookPayload {
  title: { fa: string };
  slug: string;
  code: string;
  stage: string;
  grade: string;
  field?: string | null;
  subject: string;
  academicYear: string;
  sourceType: CmsTextbookSourceType;
  externalUrl?: string | null;
  sourceAttribution: string;
}

export interface CmsTextbookListResponse {
  items: CmsTextbook[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}
