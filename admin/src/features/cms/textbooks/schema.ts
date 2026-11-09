import { z } from "zod";

import type { CmsTextbook } from "./types";
import type { CmsTextbookStatus } from "./types";
import type { CmsTextbookSourceType } from "./types";
import type { TextbookPayload } from "./types";

export const textbookFormSchema = z
  .object({
    title: z.string().trim().min(1, "عنوان فارسی الزامی است").max(200),
    code: z.string().trim().min(1, "کد کتاب الزامی است").max(80),
    stage: z.string().trim().min(1, "انتخاب مقطع الزامی است").max(100),
    grade: z.string().trim().min(1, "انتخاب پایه الزامی است").max(80),
    field: z.string().trim().max(100),
    subject: z.string().trim().min(1, "انتخاب درس الزامی است").max(120),
    academicYear: z.string().trim().min(1, "سال تحصیلی الزامی است").max(24),
    sourceType: z.enum(["UPLOADED", "EXTERNAL_LINK"]),
    externalUrl: z.string().trim(),
    sourceAttribution: z.string().trim().min(1, "منبع یا پدیدآورنده الزامی است").max(300),
    status: z.enum(["draft", "published", "archived"]),
  })
  .superRefine((data, context) => {
    if (data.sourceType !== "EXTERNAL_LINK") return;
    try {
      if (new URL(data.externalUrl).protocol !== "https:") throw new Error();
    } catch {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["externalUrl"],
        message: "نشانی منبع باید معتبر و از نوع HTTPS باشد",
      });
    }
  });

export type TextbookFormData = z.infer<typeof textbookFormSchema>;

export function textbookToFormData(book: CmsTextbook | null): TextbookFormData {
  return book
    ? {
        title: book.title.fa,
        code: book.code,
        stage: book.stage,
        grade: book.grade,
        field: book.field ?? "",
        subject: book.subject,
        academicYear: book.academicYear,
        sourceType: book.sourceType,
        externalUrl: book.externalUrl ?? "",
        sourceAttribution: book.sourceAttribution,
        status: book.status,
      }
    : {
        title: "",
        code: "",
        stage: "",
        grade: "",
        field: "",
        subject: "",
        academicYear: "",
        sourceType: "UPLOADED",
        externalUrl: "",
        sourceAttribution: "",
        status: "draft",
      };
}

function slugFrom(value: string): string {
  const slug = value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || `textbook-${crypto.randomUUID()}`;
}

export function formDataToPayload(
  data: TextbookFormData,
  book: CmsTextbook | null,
): TextbookPayload {
  return {
    title: { fa: data.title.trim() },
    slug: book?.slug ?? slugFrom(data.code),
    code: data.code.trim(),
    stage: data.stage.trim(),
    grade: data.grade.trim(),
    field: data.field.trim() || null,
    subject: data.subject.trim(),
    academicYear: data.academicYear.trim(),
    sourceType: data.sourceType as CmsTextbookSourceType,
    externalUrl: data.sourceType === "EXTERNAL_LINK" ? data.externalUrl.trim() : null,
    sourceAttribution: data.sourceAttribution.trim(),
  };
}

export function availableTextbookStatuses(
  sourceType: CmsTextbookSourceType,
  currentStatus: CmsTextbookStatus,
): CmsTextbookStatus[] {
  const statuses: CmsTextbookStatus[] = ["draft", "archived"];
  if (sourceType === "EXTERNAL_LINK" || currentStatus === "published") {
    statuses.splice(1, 0, "published");
  }
  return statuses;
}
