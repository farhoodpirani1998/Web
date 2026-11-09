import { describe, expect, it } from "vitest";

import {
  campusFormSchema,
  formDataToCreatePayload,
  formDataToUpdatePayload,
} from "./schema";

describe("campus grade levels", () => {
  const formData = campusFormSchema.parse({
    titleFa: "پردیس مرکزی",
    slug: "central-campus",
    bodyFa: "توضیحات",
    gradeLevels: "پایه اول، پایه دوم\nپایه اول",
  });

  it("normalizes and deduplicates grade levels on create", () => {
    expect(formDataToCreatePayload(formData).gradeLevels).toEqual([
      "پایه اول",
      "پایه دوم",
    ]);
  });

  it("clears grade levels when an edited campus has no values", () => {
    expect(
      formDataToUpdatePayload({ ...formData, gradeLevels: "" }).gradeLevels,
    ).toBeNull();
  });
});
