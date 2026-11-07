import { z } from "zod";
export const statisticLabelSchema = z.object({ fa: z.string().min(1,"عنوان فارسی الزامی است"), en: z.string().optional() });
export const createStatisticPayloadSchema = z.object({ label: statisticLabelSchema, value: z.number().min(0,"مقدار باید غیرمنفی باشد"), suffix: z.string().optional() });
export const updateStatisticPayloadSchema = z.object({ label: statisticLabelSchema.partial().optional(), value: z.number().optional(), suffix: z.string().optional().nullable() });
export type CreateStatisticPayloadInput = z.infer<typeof createStatisticPayloadSchema>;
export type UpdateStatisticPayloadInput = z.infer<typeof updateStatisticPayloadSchema>;
