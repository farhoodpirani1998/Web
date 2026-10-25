/**
 * Zod validation schemas for the FAQ module.
 *
 * Centralizes validation logic (create/update payloads, form fields)
 * so the form, API layer, and any future server-driven validation share
 * the exact same rules. Mirrors backend DTOs.
 */
import { z } from "zod";

import type { Translatable } from "../types";

const translatableSchema = z.object({
  fa: z.string().min(1, "فیلد فارسی الزامی است"),
  en: z.string().optional(),
});

/** Payload for POST /admin/faqs — mirrors CreateFaqDto. */
export const createFaqPayloadSchema = z.object({
  question: translatableSchema,
  answer: translatableSchema,
  category: z.string().optional(),
});

export type CreateFaqPayload = z.infer<typeof createFaqPayloadSchema>;

/** Payload for PATCH /admin/faqs/:id — mirrors UpdateFaqDto. */
export const updateFaqPayloadSchema = z.object({
  question: translatableSchema.partial().optional(),
  answer: translatableSchema.partial().optional(),
  category: z.string().optional().nullable(),
});

export type UpdateFaqPayload = z.infer<typeof updateFaqPayloadSchema>;

/** Form field schema (what React Hook Form validates). Flat fields. */
export const faqFormSchema = z.object({
  questionFa: z.string().min(1, "پرسش (فارسی) الزامی است"),
  questionEn: z.string().optional(),
  answerFa: z.string().min(1, "پاسخ (فارسی) الزامی است"),
  answerEn: z.string().optional(),
  category: z.string().optional(),
});

export type FaqFormData = z.infer<typeof faqFormSchema>;

/** Flat form -> nested create payload. */
export function formDataToCreatePayload(data: FaqFormData): CreateFaqPayload {
  return {
    question: {
      fa: data.questionFa.trim(),
      ...(data.questionEn?.trim() ? { en: data.questionEn.trim() } : {}),
    },
    answer: {
      fa: data.answerFa.trim(),
      ...(data.answerEn?.trim() ? { en: data.answerEn.trim() } : {}),
    },
    ...(data.category?.trim() ? { category: data.category.trim() } : {}),
  };
}

/** Flat form -> nested update payload. */
export function formDataToUpdatePayload(data: FaqFormData): UpdateFaqPayload {
  const payload: UpdateFaqPayload = {};
  if (data.questionFa !== undefined || data.questionEn !== undefined) {
    payload.question = {};
    if (data.questionFa?.trim()) payload.question.fa = data.questionFa.trim();
    if (data.questionEn?.trim()) payload.question.en = data.questionEn.trim();
  }
  if (data.answerFa !== undefined || data.answerEn !== undefined) {
    payload.answer = {};
    if (data.answerFa?.trim()) payload.answer.fa = data.answerFa.trim();
    if (data.answerEn?.trim()) payload.answer.en = data.answerEn.trim();
  }
  payload.category = data.category?.trim() || null;
  return payload;
}

/** Existing CmsFaq -> flat form data for edit pre-population. */
export function faqToFormData(faq: {
  question: Translatable<string>;
  answer: Translatable<string>;
  category?: string;
}): FaqFormData {
  return {
    questionFa: faq.question.fa ?? "",
    questionEn: faq.question.en ?? "",
    answerFa: faq.answer.fa ?? "",
    answerEn: faq.answer.en ?? "",
    category: faq.category ?? "",
  };
}
