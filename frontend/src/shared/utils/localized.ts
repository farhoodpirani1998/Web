export type LocalizedText = string | { fa?: string; en?: string } | null | undefined;

export function resolveLocalizedText(value: LocalizedText, fallback = ""): string {
  if (value == null) return fallback;

  if (typeof value === "string") return value || fallback;

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const preferred = record.fa ?? record.en;
    if (typeof preferred === "string" && preferred.trim()) return preferred;

    const firstString = Object.values(record).find((entry) => typeof entry === "string");
    if (typeof firstString === "string" && firstString.trim()) return firstString;
  }

  return fallback;
}
