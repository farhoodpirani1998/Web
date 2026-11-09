import { describe, expect, it } from "vitest";

import { FEATURE_ICON_KEYS } from "./iconOptions";
import { featureFormSchema } from "./schema";

describe("feature icon allowlist", () => {
  it("accepts public ICON_MAP keys and rejects unknown names", () => {
    for (const key of FEATURE_ICON_KEYS) {
      expect(
        featureFormSchema.safeParse({
          titleFa: "عنوان",
          descriptionFa: "توضیح",
          icon: key,
          position: 0,
        }).success,
      ).toBe(true);
    }

    expect(
      featureFormSchema.safeParse({
        titleFa: "عنوان",
        descriptionFa: "توضیح",
        icon: "UnknownIcon",
        position: 0,
      }).success,
    ).toBe(false);
  });
});
