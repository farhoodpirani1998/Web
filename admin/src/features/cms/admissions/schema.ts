import { z } from "zod";
export const kindSchema = z.enum(["step","requirement","required_document","tuition_plan"]);
export const translatableSchema = z.object({ fa: z.string().min(1,"عنوان فارسی الزامی است"), en: z.string().optional() });
export const createAdmissionPayloadSchema = z.object({
  kind: kindSchema,
  title: translatableSchema,
  value: z.string().optional(),
  description: translatableSchema.partial().optional(),
  price: z.string().optional(),
  period: z.string().optional(),
  includes: z.array(z.string()).optional(),
});
export const updateAdmissionPayloadSchema = z.object({
  kind: kindSchema.optional(),
  title: translatableSchema.partial().optional(),
  value: z.string().optional().nullable(),
  description: translatableSchema.partial().optional().nullable(),
  price: z.string().optional().nullable(),
  period: z.string().optional().nullable(),
  includes: z.array(z.string()).optional().nullable(),
});
export type CreateAdmissionPayloadInput = z.infer<typeof createAdmissionPayloadSchema>;
export type UpdateAdmissionPayloadInput = z.infer<typeof updateAdmissionPayloadSchema>;
