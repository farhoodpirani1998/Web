import { z } from "zod";

export const kindSchema = z.enum(["year_stat","term","holiday","exam_period","important_date"]);

export const translatableSchema = z.object({ fa: z.string().min(1,"عنوان فارسی الزامی است"), en: z.string().optional() });

export const createAcademicCalendarPayloadSchema = z.object({
  kind: kindSchema,
  title: translatableSchema,
  value: z.string().optional(),
  dateRange: z.string().optional(),
  date: z.string().optional(),
  description: translatableSchema.partial().optional(),
});

export const updateAcademicCalendarPayloadSchema = z.object({
  kind: kindSchema.optional(),
  title: translatableSchema.partial().optional(),
  value: z.string().optional().nullable(),
  dateRange: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
  description: translatableSchema.partial().optional().nullable(),
});

export type CreateAcademicCalendarPayloadInput = z.infer<typeof createAcademicCalendarPayloadSchema>;
export type UpdateAcademicCalendarPayloadInput = z.infer<typeof updateAcademicCalendarPayloadSchema>;
