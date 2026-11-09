import { z } from "zod";
import type { Translatable } from "../types";
import type {
  CreateTrustBadgePayload,
  UpdateTrustBadgePayload,
} from "./types";

export const trustBadgeFormSchema = z.object({
  nameFa: z.string().trim().min(1, "عنوان فارسی الزامی است"),
  nameEn: z.string().trim().optional(),
  url: z.string().trim().url("نشانی باید معتبر باشد").optional().or(z.literal("")),
  imageMediaId: z.string().uuid("انتخاب تصویر الزامی است"),
});

export type TrustBadgeFormData = z.infer<typeof trustBadgeFormSchema>;

export function trustBadgeToFormData(badge: {
  name: Translatable<string>;
  url?: string;
  imageMediaId?: string;
}): TrustBadgeFormData {
  return {
    nameFa: badge.name.fa,
    nameEn: badge.name.en ?? "",
    url: badge.url ?? "",
    imageMediaId: badge.imageMediaId ?? "",
  };
}

function toPayload(data: TrustBadgeFormData) {
  return {
    name: {
      fa: data.nameFa.trim(),
      ...(data.nameEn?.trim() ? { en: data.nameEn.trim() } : {}),
    },
    ...(data.url?.trim() ? { url: data.url.trim() } : {}),
    imageMediaId: data.imageMediaId,
  };
}

export function formDataToCreatePayload(
  data: TrustBadgeFormData,
): CreateTrustBadgePayload {
  return toPayload(data);
}

export function formDataToUpdatePayload(
  data: TrustBadgeFormData,
): UpdateTrustBadgePayload {
  const { url, ...payload } = toPayload(data);
  return { ...payload, url: url ?? null };
}
