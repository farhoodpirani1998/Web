import { describe, expect, it } from "vitest";
import {
  formDataToCreatePayload,
  formDataToUpdatePayload,
  trustBadgeFormSchema,
} from "./schema";

const validForm = {
  nameFa: "نشان آموزشی",
  nameEn: "Education badge",
  url: "https://example.test/verify",
  imageMediaId: "c6f63d99-c15d-4c48-b8e8-6420ca45ef96",
};

describe("trustBadgeFormSchema", () => {
  it("requires a Persian name and selected media", () => {
    expect(trustBadgeFormSchema.safeParse(validForm).success).toBe(true);
    expect(
      trustBadgeFormSchema.safeParse({ ...validForm, imageMediaId: "" }).success,
    ).toBe(false);
  });

  it("converts optional links and English names into API payloads", () => {
    const parsed = trustBadgeFormSchema.parse(validForm);
    expect(formDataToCreatePayload(parsed)).toEqual({
      name: { fa: "نشان آموزشی", en: "Education badge" },
      url: "https://example.test/verify",
      imageMediaId: validForm.imageMediaId,
    });
    expect(formDataToUpdatePayload({ ...parsed, url: "" }).url).toBeNull();
  });
});
