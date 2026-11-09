import type { CmsEntityMeta, CmsPublishStatus, Translatable } from "../types";

export type CmsTrustBadgeStatus = CmsPublishStatus;

export interface CmsTrustBadge extends CmsEntityMeta {
  name: Translatable<string>;
  url?: string;
  imageMediaId?: string;
  position: number;
  status: CmsTrustBadgeStatus;
}

export interface CreateTrustBadgePayload {
  name: Translatable<string>;
  url?: string;
  imageMediaId: string;
}

export interface UpdateTrustBadgePayload {
  name?: Translatable<string>;
  url?: string | null;
  imageMediaId?: string | null;
}
