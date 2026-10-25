import { describe, expect, it } from "vitest";

import { describeEntry } from "./describeEntry";
import type { CmsAuditLogEntry } from "./types";

function entry(partial: Partial<CmsAuditLogEntry>): CmsAuditLogEntry {
  return { id: "1", action: "published", createdAt: "2026-10-13T00:00:00Z", ...partial };
}

describe("describeEntry", () => {
  it("maps a publish action on a known entity to a Persian sentence", () => {
    expect(describeEntry(entry({ action: "published", entityType: "news" }))).toContain("خبر");
  });

  it("maps draft and archived actions", () => {
    expect(describeEntry(entry({ action: "draft", entityType: "page" }))).toContain("پیش‌نویس");
    expect(describeEntry(entry({ action: "archived", entityType: "event" }))).toContain(
      "بایگانی",
    );
  });

  it("handles the media_uploaded literal", () => {
    expect(describeEntry(entry({ action: "media_uploaded" }))).toBe("رسانه‌ای بارگذاری شد");
  });

  it("includes the settings group for settings_updated", () => {
    expect(
      describeEntry(entry({ action: "settings_updated", metadata: { group: "social_links" } })),
    ).toContain("social links");
  });

  it("falls back to a generic sentence when no group is present", () => {
    expect(describeEntry(entry({ action: "settings_updated" }))).toBe(
      "تنظیمات سایت به‌روزرسانی شد",
    );
  });

  it("falls back to the raw action for an unknown combination", () => {
    expect(describeEntry(entry({ action: "frobnicated", entityType: "news" }))).toBe(
      "خبر: frobnicated",
    );
    expect(describeEntry(entry({ action: "frobnicated" }))).toBe("frobnicated");
  });
});
