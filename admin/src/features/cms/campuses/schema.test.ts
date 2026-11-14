import { describe, expect, it } from "vitest";

import {
  campusFormSchema,
  campusToFormData,
  createCampusPayloadSchema,
  formDataToCreatePayload,
  formDataToUpdatePayload,
  updateCampusPayloadSchema,
} from "./schema";

const validCampusForm = {
  titleFa: "پردیس مرکزی",
  slug: "central-campus",
  bodyFa: "توضیحات",
};

describe("campus grade levels", () => {
  const formData = campusFormSchema.parse({
    ...validCampusForm,
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

describe("campus map coordinates", () => {
  it("accepts coordinate range boundaries and rejects out-of-range values", () => {
    expect(
      campusFormSchema.safeParse({
        ...validCampusForm,
        latitude: "-90",
        longitude: "180",
      }).success,
    ).toBe(true);
    expect(
      campusFormSchema.safeParse({
        ...validCampusForm,
        latitude: "90.01",
      }).success,
    ).toBe(false);
    expect(
      campusFormSchema.safeParse({
        ...validCampusForm,
        longitude: "-180.01",
      }).success,
    ).toBe(false);
  });

  it("persists numeric coordinates in a create payload", () => {
    const formData = campusFormSchema.parse({
      ...validCampusForm,
      latitude: "35.7219",
      longitude: "51.3347",
    });

    expect(
      createCampusPayloadSchema.parse(formDataToCreatePayload(formData)),
    ).toMatchObject({
      latitude: 35.7219,
      longitude: 51.3347,
    });
  });

  it("restores saved coordinates to editable form values", () => {
    const formData = campusToFormData({
      title: { fa: validCampusForm.titleFa },
      slug: validCampusForm.slug,
      body: { fa: validCampusForm.bodyFa },
      latitude: 35.7219,
      longitude: 51.3347,
      seo: { noindex: false },
    });

    expect(formData.latitude).toBe("35.7219");
    expect(formData.longitude).toBe("51.3347");
  });

  it("sends explicit nulls when edited coordinates are cleared", () => {
    const formData = campusFormSchema.parse({
      ...validCampusForm,
      latitude: "",
      longitude: "",
    });

    expect(
      updateCampusPayloadSchema.parse(formDataToUpdatePayload(formData)),
    ).toMatchObject({
      latitude: null,
      longitude: null,
    });
  });
});
