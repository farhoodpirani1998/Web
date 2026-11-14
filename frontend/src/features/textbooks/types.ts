import type { Translatable } from "./types.shared";

export interface PublicPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PublicPaginatedResponse<T> {
  items: T[];
  meta: PublicPaginationMeta;
}

export interface PublicTextbookTaxonomyOption {
  value: string;
  label: string;
}

export interface PublicTextbookTaxonomies {
  stage: PublicTextbookTaxonomyOption[];
  grade: PublicTextbookTaxonomyOption[];
  field: PublicTextbookTaxonomyOption[];
  subject: PublicTextbookTaxonomyOption[];
  year: PublicTextbookTaxonomyOption[];
}

export type PublicTextbookSort = "title" | "year" | "sortOrder";
export type PublicTextbookSortOrder = "ASC" | "DESC";

export interface TextbookListParams {
  page?: number;
  q?: string;
  stage?: string;
  grade?: string;
  field?: string;
  subject?: string;
  year?: string;
  sort?: PublicTextbookSort;
  order?: PublicTextbookSortOrder;
}

export interface PublicTextbookListItemDto {
  id: string;
  title: Translatable<string>;
  slug: string;
  code: string;
  stage: string;
  grade: string;
  field: string | null;
  subject: string;
  academicYear: string;
  edition: string | null;
  pageCount: number | null;
  fileSize: string;
  sourceType: "UPLOADED" | "EXTERNAL_LINK";
  sourceAttribution: string;
  licenseNote: string | null;
  downloadCount: string;
  createdAt: string;
  coverUrl: string | null;
  downloadUrl: string;
}

export interface PublicTextbookDetailDto {
  id: string;
  title: Translatable<string>;
  slug: string;
  code: string;
  stage: string;
  grade: string;
  field: string | null;
  subject: string;
  academicYear: string;
  edition: string | null;
  pageCount: number | null;
  fileSize: string;
  sourceType: "UPLOADED" | "EXTERNAL_LINK";
  sourceAttribution: string;
  licenseNote: string | null;
  downloadCount: string;
  createdAt: string;
  coverUrl: string | null;
  downloadUrl: string;
}
