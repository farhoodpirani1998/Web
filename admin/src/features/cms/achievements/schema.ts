import { z } from "zod";

export const achievementValueSchema = z.string().min(1, "مقدار الزامی است");

export const achievementLabelSchema = z.object({
  fa: z.string().min(1, "عنوان فارسی الزامی است"),
  en: z.string().optional(),
});

export const createAchievementPayloadSchema = z.object({
  value: achievementValueSchema,
  label: achievementLabelSchema,
  icon: z.string().optional(),
});

export const updateAchievementPayloadSchema = z.object({
  value: achievementValueSchema.optional(),
  label: achievementLabelSchema.partial().optional(),
  icon: z.string().optional().nullable(),
});

export type CreateAchievementPayloadInput = z.infer<typeof createAchievementPayloadSchema>;
export type UpdateAchievementPayloadInput = z.infer<typeof updateAchievementPayloadSchema>;
